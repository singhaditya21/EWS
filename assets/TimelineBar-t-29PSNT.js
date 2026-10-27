import{c as a,j as e,m as x}from"./index-CZ3Zb4iQ.js";/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=a("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=a("SkipForward",[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]]),y=[.25,.5,1,2],g=({isPlaying:t,onTogglePlay:l,onStepForward:n,onReset:d,speed:i,onSpeedChange:c,elapsedLabel:o,statusBadge:r})=>e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#111827]/95 border border-[#1F2937] backdrop-blur-md",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsxs("button",{type:"button",onClick:l,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${t?"bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30":"bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-sm shadow-cyan-500/20"}`,children:[t?e.jsx(p,{className:"w-3.5 h-3.5"}):e.jsx(b,{className:"w-3.5 h-3.5"}),t?"Pause":"Play"]}),n&&e.jsxs("button",{type:"button",onClick:n,disabled:t,title:"Step forward one frame",className:"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors",children:[e.jsx(h,{className:"w-3.5 h-3.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Step"})]}),e.jsxs("button",{type:"button",onClick:d,title:"Reset simulation",className:"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors",children:[e.jsx(x,{className:"w-3.5 h-3.5"}),e.jsx("span",{className:"hidden sm:inline",children:"Reset"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[r&&e.jsx("span",{className:"px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300",children:r}),o&&e.jsx("span",{className:"text-xs font-mono text-slate-400 hidden md:inline",children:o}),e.jsxs("div",{className:"flex items-center gap-1 bg-[#090D16] p-1 rounded-lg border border-slate-800",children:[e.jsx(m,{className:"w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5"}),y.map(s=>e.jsxs("button",{type:"button",onClick:()=>c(s),className:`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${i===s?"bg-cyan-500/20 text-cyan-300 border border-cyan-500/40":"text-slate-400 hover:text-slate-200"}`,children:[s,"x"]},s))]})]})]});export{g as T};
