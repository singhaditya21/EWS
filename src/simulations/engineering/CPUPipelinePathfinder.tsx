import React, { useState, useMemo } from 'react';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Cpu, Route, Play, RotateCcw, FastForward } from 'lucide-react';

type CSMode = 'pathfinder' | 'cpu-pipeline';
type SearchAlgo = 'astar' | 'dijkstra' | 'bfs';

const ROWS = 9;
const COLS = 16;
const START = { r: 4, c: 1 };
const GOAL = { r: 4, c: 14 };

const DEFAULT_WALLS = new Set([
  '2,5', '3,5', '4,5', '5,5', '6,5',
  '1,9', '2,9', '3,9', '4,9',
  '5,11', '6,11', '7,11',
]);

interface PipelineInstruction {
  id: number;
  asm: string;
  dest: string;
  src1: string;
  src2: string;
  hazardNote?: string;
}

const RISC_PROGRAM: PipelineInstruction[] = [
  { id: 1, asm: 'ADD R1, R2, R3', dest: 'R1', src1: 'R2', src2: 'R3' },
  {
    id: 2,
    asm: 'SUB R4, R1, R5',
    dest: 'R4',
    src1: 'R1',
    src2: 'R5',
    hazardNote: 'RAW Hazard on R1 (EX/MEM → EX Forwarding active)',
  },
  { id: 3, asm: 'AND R6, R1, R7', dest: 'R6', src1: 'R1', src2: 'R7', hazardNote: 'RAW Hazard on R1 (MEM/WB → EX Forwarding active)' },
  { id: 4, asm: 'LW  R8, 0(R4)', dest: 'R8', src1: 'R4', src2: '-' },
  { id: 5, asm: 'OR  R9, R8, R2', dest: 'R9', src1: 'R8', src2: 'R2', hazardNote: 'Load-Use Hazard on R8 (1-Cycle Bubble / Stall)' },
];

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'] as const;

export const CPUPipelinePathfinder: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<CSMode>(
    initialMode === 'cpu-pipeline' ? 'cpu-pipeline' : 'pathfinder'
  );
  const [algo, setAlgo] = useState<SearchAlgo>('astar');
  const [walls, setWalls] = useState<Set<string>>(() => new Set(DEFAULT_WALLS));
  const [clockCycle, setClockCycle] = useState(5);
  const [forwardingEnabled, setForwardingEnabled] = useState(true);

  const toggleWall = (r: number, c: number) => {
    if ((r === START.r && c === START.c) || (r === GOAL.r && c === GOAL.c)) return;
    const key = `${r},${c}`;
    setWalls((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Run A*, Dijkstra, or BFS synchronously whenever walls or algo change
  const searchResult = useMemo(() => {
    const visitedOrder: string[] = [];
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const startKey = `${START.r},${START.c}`;
    const goalKey = `${GOAL.r},${GOAL.c}`;
    gScore.set(startKey, 0);

    const heuristic = (r: number, c: number) =>
      algo === 'astar' ? (Math.abs(r - GOAL.r) + Math.abs(c - GOAL.c)) * 1.2 : 0;

    const open: { r: number; c: number; f: number }[] = [
      { r: START.r, c: START.c, f: heuristic(START.r, START.c) },
    ];
    const closed = new Set<string>();

    while (open.length > 0) {
      if (algo !== 'bfs') {
        open.sort((a, b) => a.f - b.f);
      }
      const cur = open.shift()!;
      const curKey = `${cur.r},${cur.c}`;
      if (closed.has(curKey)) continue;
      closed.add(curKey);
      visitedOrder.push(curKey);

      if (curKey === goalKey) break;

      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        const nKey = `${nr},${nc}`;
        if (
          nr < 0 ||
          nr >= ROWS ||
          nc < 0 ||
          nc >= COLS ||
          walls.has(nKey) ||
          closed.has(nKey)
        ) {
          continue;
        }
        const tentativeG = (gScore.get(curKey) ?? 0) + 1;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, curKey);
          gScore.set(nKey, tentativeG);
          open.push({
            r: nr,
            c: nc,
            f: tentativeG + heuristic(nr, nc),
          });
        }
      }
    }

    const path = new Set<string>();
    let curr: string | undefined = goalKey;
    if (cameFrom.has(goalKey)) {
      while (curr) {
        path.add(curr);
        curr = cameFrom.get(curr);
      }
    }

    return {
      visitedSet: new Set(visitedOrder),
      pathSet: path,
      visitedCount: visitedOrder.length,
      pathLength: Math.max(0, path.size - 1),
    };
  }, [walls, algo]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('pathfinder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pathfinder'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            Algorithms: A* / Dijkstra / BFS Grid Pathfinder
          </button>
          <button
            type="button"
            onClick={() => setMode('cpu-pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'cpu-pipeline'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Computer Architecture: 5-Stage RISC CPU Pipeline
          </button>
        </div>
      </div>

      {mode === 'pathfinder' ? (
        <>
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Interactive Graph Search & Shortest-Path Grid (Click cells to toggle obstacles)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Green = Start (S) • Rose = Goal (G) • Amber = Optimal Shortest Path • Cyan = Explored Frontier
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWalls(new Set(DEFAULT_WALLS))}
                className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Maze
              </button>
            </div>

            <div
              className="grid gap-1 p-2.5 rounded-xl bg-[#090D16] border border-slate-800 overflow-x-auto"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(28px, 1fr))` }}
            >
              {Array.from({ length: ROWS }).map((_, r) =>
                Array.from({ length: COLS }).map((__, c) => {
                  const key = `${r},${c}`;
                  const isStart = r === START.r && c === START.c;
                  const isGoal = r === GOAL.r && c === GOAL.c;
                  const isWall = walls.has(key);
                  const isPath = searchResult.pathSet.has(key);
                  const isVisited = searchResult.visitedSet.has(key);

                  let cellClass = 'bg-slate-900 border-slate-800 hover:border-slate-600';
                  if (isStart) cellClass = 'bg-emerald-500 text-slate-950 font-bold border-emerald-300';
                  else if (isGoal) cellClass = 'bg-rose-500 text-white font-bold border-rose-300';
                  else if (isWall) cellClass = 'bg-slate-700 border-slate-500';
                  else if (isPath) cellClass = 'bg-amber-500/80 border-amber-300 text-slate-950 font-bold';
                  else if (isVisited) cellClass = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleWall(r, c)}
                      className={`h-8 rounded border text-[10px] font-mono flex items-center justify-center transition-all ${cellClass}`}
                    >
                      {isStart ? 'S' : isGoal ? 'G' : isWall ? '█' : isPath ? '•' : ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <FormulaCard
            label="A* Heuristic Evaluation Function"
            latex="f(n) = g(n) + h(n), \quad h_{\text{Manhattan}}(n) = |x_n - x_{\text{goal}}| + |y_n - y_{\text{goal}}|"
            liveSubstitution={`\\text{Nodes Expanded} = ${searchResult.visitedCount}, \\quad \\text{Optimal Path Cost } g(G) = ${searchResult.pathLength}`}
            accentColor="amber"
          />

          <ParameterPanel
            title="Graph Search Algorithm Selector"
            presets={[
              {
                id: 'astar',
                label: 'A* Informed Heuristic Search',
                active: algo === 'astar',
                onSelect: () => setAlgo('astar'),
              },
              {
                id: 'dijkstra',
                label: "Dijkstra's Shortest Path (h = 0)",
                active: algo === 'dijkstra',
                onSelect: () => setAlgo('dijkstra'),
              },
              {
                id: 'bfs',
                label: 'Breadth-First Search (Unweighted FIFO)',
                active: algo === 'bfs',
                onSelect: () => setAlgo('bfs'),
              },
            ]}
            telemetry={[
              { label: 'Active Algorithm', value: algo.toUpperCase(), color: 'amber' },
              { label: 'Nodes Visited', value: `${searchResult.visitedCount}`, color: 'cyan' },
              { label: 'Shortest Path Cost', value: `${searchResult.pathLength}`, unit: 'steps', color: 'emerald' },
              { label: 'Time Complexity', value: 'O((V+E) log V)', color: 'violet' },
            ]}
          />
        </>
      ) : (
        <>
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  5-Stage RISC CPU Pipeline Execution Diagram (IF → ID → EX → MEM → WB)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Inspect instruction overlap, data hazards (RAW), and hardware forwarding paths across clock cycles
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForwardingEnabled((f) => !f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    forwardingEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {forwardingEnabled ? 'ALU Forwarding: ON' : 'ALU Forwarding: OFF (Stalls)'}
                </button>
                <button
                  type="button"
                  onClick={() => setClockCycle((c) => (c >= 10 ? 1 : c + 1))}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1"
                >
                  <FastForward className="w-3.5 h-3.5" /> Step Clock (CC {clockCycle})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Instruction</th>
                    {Array.from({ length: 10 }).map((_, ccIdx) => (
                      <th
                        key={ccIdx}
                        className={`py-2 px-2.5 text-center ${
                          ccIdx + 1 === clockCycle ? 'text-amber-400 bg-amber-500/10' : ''
                        }`}
                      >
                        CC{ccIdx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RISC_PROGRAM.map((inst, rowIdx) => {
                    const stallOffset = !forwardingEnabled && rowIdx >= 1 ? rowIdx : rowIdx === 4 ? 1 : 0;
                    const startCycle = rowIdx + 1 + stallOffset;

                    return (
                      <tr key={inst.id} className="border-b border-slate-800/60">
                        <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                          {inst.asm}
                          {inst.hazardNote && (
                            <div className="text-[10px] text-amber-400 font-normal">
                              {inst.hazardNote}
                            </div>
                          )}
                        </td>
                        {Array.from({ length: 10 }).map((_, ccIdx) => {
                          const cycleNum = ccIdx + 1;
                          const stageIdx = cycleNum - startCycle;
                          const stage =
                            stageIdx >= 0 && stageIdx < 5 ? STAGES[stageIdx] : null;
                          const isStall =
                            rowIdx === 4 && cycleNum === startCycle - 1;

                          return (
                            <td
                              key={ccIdx}
                              className={`py-2 px-1.5 text-center ${
                                cycleNum === clockCycle ? 'bg-amber-500/10' : ''
                              }`}
                            >
                              {stage && (
                                <span className="inline-block px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">
                                  {stage}
                                </span>
                              )}
                              {isStall && (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px]">
                                  STALL
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <FormulaCard
            label="Pipelined Processor Speedup & CPI Equation"
            latex="\text{CPI}_{\text{pipelined}} = \text{CPI}_{\text{ideal}} + \text{Stall Cycles per Instruction}, \quad S = \frac{T_{\text{unpipelined}}}{T_{\text{pipelined}}}"
            liveSubstitution={`\\text{Active Clock} = \\text{CC}${clockCycle}, \\quad \\text{Effective CPI} = ${
              forwardingEnabled ? '1.20' : '1.60'
            }`}
            accentColor="amber"
          />

          <ParameterPanel
            title="Pipeline Clock & Hazard Controls"
            sliders={[
              {
                id: 'cc',
                label: 'Active Clock Cycle (CC)',
                value: clockCycle,
                min: 1,
                max: 10,
                step: 1,
                onChange: setClockCycle,
              },
            ]}
            telemetry={[
              { label: 'Pipeline Depth', value: '5 Stages', color: 'amber' },
              { label: 'Effective CPI', value: forwardingEnabled ? '1.20' : '1.60', color: 'emerald' },
              { label: 'Forwarding Unit', value: forwardingEnabled ? 'EX/MEM & MEM/WB' : 'Disabled', color: 'cyan' },
              { label: 'Throughput Boost', value: forwardingEnabled ? '4.17x' : '3.12x', color: 'violet' },
            ]}
          />
        </>
      )}
    </div>
  );
};
