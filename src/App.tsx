import React, { useEffect, useState } from 'react';
import { CURRICULUM_DATA } from './data/curriculum';
import {
  CurriculumChapter,
  EducationTrack,
  SchoolBoard,
} from './types/curriculum.types';
import { Navbar } from './components/layout/Navbar';
import { CurriculumSidebar } from './components/layout/CurriculumSidebar';
import { LabWorkspace } from './components/layout/LabWorkspace';
import { progress, useActiveProfile } from './class1/progressStore';
import { useRoute } from './platform/nav';
import { initSession } from './platform/session';
import { startSync } from './platform/sync';
import { useStudentSession } from './platform/student';
import { PlansPage } from './platform/components/PlansPage';
import { AccountPage } from './platform/components/AccountPage';
import { ClassroomPage } from './platform/components/ClassroomPage';
import { InvitePage, SchoolPage } from './platform/components/SchoolPage';
import { StudentLoginPage } from './platform/components/StudentLoginPage';
import { LegalPage } from './platform/components/LegalPage';

export const App: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<EducationTrack>('school');
  const [activeBoard, setActiveBoard] = useState<SchoolBoard>('CBSE');
  const [activeClassLevel, setActiveClassLevel] = useState<number | 'ALL'>(1);
  const [selectedChapter, setSelectedChapter] = useState<CurriculumChapter>(
    CURRICULUM_DATA.find((c) => c.id === 'cls1-math-spatial-furry-cat') ||
      CURRICULUM_DATA[0]
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [kidFocusMode, setKidFocusMode] = useState(false);
  // Completed lessons belong to the active child profile and are saved on this device.
  const completedChapterIds = useActiveProfile().completedChapterIds;
  const route = useRoute();

  useEffect(() => {
    startSync();
    void initSession();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page]);

  // A child signed in at school learns in their class's board, in Class 1.
  const student = useStudentSession();
  useEffect(() => {
    if (!student) return;
    setActiveTrack('school');
    setActiveBoard(student.board);
    setActiveClassLevel(1);
  }, [student]);
  const handleToggleComplete = (chapterId: string) => progress.toggleComplete(chapterId);

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

  const handleToggleKidFocusMode = () => {
    setKidFocusMode((prev) => {
      const next = !prev;
      if (next) {
        setActiveTrack('school');
        if (activeClassLevel === 'ALL' || (typeof activeClassLevel === 'number' && activeClassLevel > 5)) {
          setActiveClassLevel(1);
          const firstClass1 = CURRICULUM_DATA.find((c) => c.classLevel === 1);
          if (firstClass1) setSelectedChapter(firstClass1);
        }
      }
      return next;
    });
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
        kidFocusMode={kidFocusMode}
        onToggleKidFocusMode={handleToggleKidFocusMode}
      />

      {route.page ? (
        <div className="flex-1 flex min-h-0">
          {route.page === 'plans' && <PlansPage />}
          {route.page === 'account' && <AccountPage />}
          {route.page === 'classroom' && <ClassroomPage />}
          {route.page === 'school' && <SchoolPage />}
          {route.page === 'invite' && <InvitePage token={route.arg} />}
          {route.page === 'student' && <StudentLoginPage initialCode={route.query.get('code')} />}
          {(route.page === 'privacy' || route.page === 'terms') && <LegalPage kind={route.page} />}
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          <CurriculumSidebar
            chapters={CURRICULUM_DATA}
            activeTrack={activeTrack}
            activeBoard={activeBoard}
            activeClassLevel={activeClassLevel}
            selectedChapter={selectedChapter}
            onSelectChapter={handleSelectChapter}
            completedChapterIds={completedChapterIds}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          <LabWorkspace
            chapter={selectedChapter}
            activeBoard={activeBoard}
            chapters={CURRICULUM_DATA}
            onSelectChapter={handleSelectChapter}
            completedChapterIds={completedChapterIds}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      )}
    </div>
  );
};

export default App;
