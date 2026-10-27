// A child at school signs in with the class code, taps their name and their 3 secret pictures.
// There is no child account: the teacher's class holds the progress, and the session lasts
// only for this browser tab (sessionStorage), so a shared classroom device is safe.
import { useSyncExternalStore } from 'react';
import { callFunction } from './supabase';
import { SchoolBoard } from '../types/curriculum.types';
import { ProfileData, newProfile, progress } from '../class1/progressStore';

export interface RosterEntry {
  id: string;
  display_name: string;
  avatar: string | null;
}

export interface StudentSession {
  token: string;
  classCode: string;
  board: SchoolBoard;
  student: { id: string; display_name: string; avatar: string | null };
  assignments: { chapter_id: string; due_on: string | null }[];
  /** Profile that was active before the student signed in, to restore afterwards. */
  previousProfileId: string;
}

const KEY = 'omnilearn_student_session';
/** Pictures children choose their secret from: easy to recognise, hard to confuse. */
export const PICTURES = ['🐶', '🐱', '🐘', '🦁', '🐸', '🐟', '🌻', '🍎', '🚗', '⭐', '🌙', '⚽'];

const read = (): StudentSession | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
};

let current = read();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const useStudentSession = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current
  );
export const getStudentSession = () => current;

export const studentProfileId = (studentId: string) => `student:${studentId}`;

export const loadRoster = (classCode: string) =>
  callFunction<{ class_id: string; class_name: string; board: SchoolBoard; students: RosterEntry[] }>('class-roster', {
    class_code: classCode.trim().toUpperCase(),
  });

export const studentSignIn = async (classCode: string, studentId: string, picture: string) => {
  const res = await callFunction<{
    token: string;
    board: SchoolBoard;
    student: { id: string; display_name: string; avatar: string | null; progress: Partial<ProfileData> | null };
    assignments: { chapter_id: string; due_on: string | null }[];
  }>('student-session', { class_code: classCode.trim().toUpperCase(), student_id: studentId, picture });

  const id = studentProfileId(res.student.id);
  const saved = res.student.progress && Object.keys(res.student.progress).length ? res.student.progress : null;
  const profile: ProfileData = { ...newProfile(res.student.display_name), ...(saved ?? {}), id, name: res.student.display_name };
  const previousProfileId = progress.getState().activeProfileId;
  progress.upsertProfile(profile, true);

  current = {
    token: res.token,
    classCode: classCode.trim().toUpperCase(),
    board: res.board,
    student: { id: res.student.id, display_name: res.student.display_name, avatar: res.student.avatar },
    assignments: res.assignments,
    previousProfileId,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Tab-only session still works in memory.
  }
  emit();
};

export const studentSignOut = () => {
  const s = current;
  current = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  // The class keeps the progress; don't leave a copy on a shared device.
  if (s) progress.removeProfile(studentProfileId(s.student.id), s.previousProfileId);
  emit();
};

export const pushStudentProgress = async (data: ProfileData) => {
  if (!current) return;
  await callFunction('student-progress', { token: current.token, data });
};
