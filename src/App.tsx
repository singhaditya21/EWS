import React, { useState } from 'react';
import { CURRICULUM_DATA } from './data/curriculum';
import {
  CurriculumChapter,
  EducationTrack,
  SchoolBoard,
} from './types/curriculum.types';
import { Navbar } from './components/layout/Navbar';
import { CurriculumSidebar } from './components/layout/CurriculumSidebar';
import { LabWorkspace } from './components/layout/LabWorkspace';

export const App: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<EducationTrack>('school');
  const [activeBoard, setActiveBoard] = useState<SchoolBoard>('CBSE');
  const [activeClassLevel, setActiveClassLevel] = useState<number | 'ALL'>('ALL');
  const [selectedChapter, setSelectedChapter] = useState<CurriculumChapter>(
    CURRICULUM_DATA.find((c) => c.id === 'cls10-phy-optics-bench') ||
      CURRICULUM_DATA[0]
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectTrack = (track: EducationTrack) => {
    setActiveTrack(track);
    const firstMatch = CURRICULUM_DATA.find((ch) => ch.track === track);
    if (firstMatch) {
      setSelectedChapter(firstMatch);
    }
  };

  const handleSelectBoard = (board: SchoolBoard) => {
    setActiveBoard(board);
    if (
      selectedChapter.track === 'school' &&
      selectedChapter.board !== 'BOTH' &&
      selectedChapter.board !== board
    ) {
      const replacement = CURRICULUM_DATA.find(
        (ch) =>
          ch.track === 'school' &&
          (ch.board === 'BOTH' || ch.board === board) &&
          (activeClassLevel === 'ALL' || ch.classLevel === activeClassLevel)
      );
      if (replacement) setSelectedChapter(replacement);
    }
  };

  const handleSelectClassLevel = (cls: number | 'ALL') => {
    setActiveClassLevel(cls);
    if (cls !== 'ALL') {
      const match = CURRICULUM_DATA.find(
        (ch) =>
          ch.track === 'school' &&
          ch.classLevel === cls &&
          (ch.board === 'BOTH' || ch.board === activeBoard)
      );
      if (match) {
        setSelectedChapter(match);
      }
    }
  };

  const handleSelectChapter = (ch: CurriculumChapter) => {
    setActiveTrack(ch.track);
    if (ch.track === 'school' && ch.board !== 'BOTH') {
      setActiveBoard(ch.board);
    }
    setSelectedChapter(ch);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      <Navbar
        activeTrack={activeTrack}
        onSelectTrack={handleSelectTrack}
        activeBoard={activeBoard}
        onSelectBoard={handleSelectBoard}
        activeClassLevel={activeClassLevel}
        onSelectClassLevel={handleSelectClassLevel}
        chapters={CURRICULUM_DATA}
        onSelectChapter={handleSelectChapter}
        onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)}
      />

      <div className="flex-1 flex min-h-0">
        <CurriculumSidebar
          chapters={CURRICULUM_DATA}
          activeTrack={activeTrack}
          activeBoard={activeBoard}
          activeClassLevel={activeClassLevel}
          selectedChapter={selectedChapter}
          onSelectChapter={handleSelectChapter}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <LabWorkspace
          chapter={selectedChapter}
          activeBoard={activeBoard}
        />
      </div>
    </div>
  );
};

export default App;
