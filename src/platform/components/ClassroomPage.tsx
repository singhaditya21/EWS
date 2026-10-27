import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SchoolBoard } from '../../types/curriculum.types';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { sortForBoard } from '../../class1/boardMap';
import { ProfileData, newProfile } from '../../class1/progressStore';
import { LEVEL_LABEL, summarise } from '../../class1/progressModel';
import { SUBJECT_LABELS } from '../../class1/skills';
import { esc, printInFrame } from '../../class1/worksheet';
import { SCHOOL_CONSENT_TEXT } from '../legal';
import { PLANS } from '../plans';
import { getClient } from '../supabase';
import { useSession } from '../session';
import { PICTURES } from '../student';
import { openPage } from '../nav';
import { usePlan } from '../entitlements';
import { Card, ErrorText, PageShell, inputCls, primaryBtn, secondaryBtn } from './PageShell';
import { GrownUpGate } from './GrownUpGate';
import { UpgradeNotice } from './UpgradeNotice';

interface ClassRow {
  id: string;
  name: string;
  board: SchoolBoard;
  class_code: string;
  created_at: string;
}
interface StudentRow {
  id: string;
  display_name: string;
  avatar: string | null;
  progress: Partial<ProfileData> | null;
  updated_at: string | null;
}
interface AssignmentRow {
  id: string;
  chapter_id: string;
  due_on: string | null;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');

/** Same formula as the database's picture_hash(): sha256 of "<class id>:<pictures>". */
const pictureHash = async (classId: string, picture: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${classId}:${picture}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
};
const randomPicture = () => Array.from({ length: 3 }, () => PICTURES[Math.floor(Math.random() * PICTURES.length)]).join('');

const CLASS1_CHAPTERS = CURRICULUM_DATA.filter((c) => c.classLevel === 1);
const studentProfile = (s: StudentRow): ProfileData => ({ ...newProfile(s.display_name), ...(s.progress ?? {}), name: s.display_name });

const CreateClass: React.FC<{ onCreated: () => void; disabled: boolean }> = ({ onCreated, disabled }) => {
  const session = useSession();
  const [name, setName] = useState('Class 1 A');
  const [board, setBoard] = useState<SchoolBoard>('CBSE');
  const [ticks, setTicks] = useState<boolean[]>(SCHOOL_CONSENT_TEXT.map(() => false));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const client = await getClient();
      for (let attempt = 0; attempt < 5; attempt++) {
        const { error: err } = await client.from('classes').insert({
          teacher_id: session.userId,
          school_id: session.school?.id ?? null,
          name: name.trim(),
          board,
          class_code: newCode(),
          consent_confirmed: true,
        });
        if (!err) {
          onCreated();
          return;
        }
        if (!/duplicate|unique/i.test(err.message)) throw new Error(/limit|maximum/i.test(err.message) ? 'Your plan’s class limit is reached.' : err.message);
      }
      throw new Error('Could not create a unique class code. Please try again.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <h2 className="text-base font-extrabold text-white">New class</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Class name" />
        <select value={board} onChange={(e) => setBoard(e.target.value as SchoolBoard)} className={inputCls}>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
        </select>
      </div>
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold uppercase text-slate-400 mb-1">School / teacher confirmation</legend>
        {SCHOOL_CONSENT_TEXT.map((t, i) => (
          <label key={t} className="flex items-start gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              className="mt-1"
              checked={ticks[i]}
              onChange={(e) => setTicks((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
            />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className={primaryBtn} disabled={disabled || busy || !name.trim() || !ticks.every(Boolean)} onClick={() => void create()}>
        {busy ? 'Creating…' : 'Create class'}
      </button>
      <ErrorText error={error} />
    </Card>
  );
};

const ClassDetail: React.FC<{ cls: ClassRow; maxStudents: number; onDeleted: () => void }> = ({ cls, maxStudents, onDeleted }) => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [newName, setNewName] = useState('');
  const [chapterId, setChapterId] = useState(CLASS1_CHAPTERS[0]?.id ?? '');
  const [dueOn, setDueOn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const client = await getClient();
    const [{ data: s }, { data: a }] = await Promise.all([
      client.from('class_students').select('id, display_name, avatar, progress, updated_at').eq('class_id', cls.id).order('display_name'),
      client.from('assignments').select('id, chapter_id, due_on').eq('class_id', cls.id).order('created_at', { ascending: false }),
    ]);
    setStudents((s ?? []) as StudentRow[]);
    setAssignments((a ?? []) as AssignmentRow[]);
  }, [cls.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const guard = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const addStudent = () =>
    guard(async () => {
      const client = await getClient();
      const picture = randomPicture();
      const { data, error: err } = await client
        .from('class_students')
        .insert({
          class_id: cls.id,
          display_name: newName.trim(),
          avatar: PICTURES[Math.floor(Math.random() * PICTURES.length)],
          picture_hash: await pictureHash(cls.id, picture),
        })
        .select('id')
        .single();
      if (err) throw new Error(/limit|maximum/i.test(err.message) ? `This class is full (${maxStudents} children).` : err.message);
      setRevealed((r) => ({ ...r, [data.id]: picture }));
      setNewName('');
    });

  const resetPicture = (s: StudentRow) =>
    guard(async () => {
      const picture = randomPicture();
      const client = await getClient();
      const { error: err } = await client.from('class_students').update({ picture_hash: await pictureHash(cls.id, picture) }).eq('id', s.id);
      if (err) throw new Error(err.message);
      setRevealed((r) => ({ ...r, [s.id]: picture }));
    });

  const summaries = useMemo(
    () => students.map((s) => ({ s, profile: studentProfile(s), subjects: summarise(studentProfile(s), cls.board) })),
    [students, cls.board]
  );

  const exportHpcCsv = () => {
    const skills = summaries[0]?.subjects.flatMap((sub) => sub.skills.map((k) => ({ id: k.id, label: `${SUBJECT_LABELS[sub.subject]}: ${k.label}` }))) ?? [];
    const rows = [
      ['Child', 'Stars', 'Lessons done', ...skills.map((k) => k.label)],
      ...summaries.map(({ s, profile, subjects }) => {
        const levels = Object.fromEntries(subjects.flatMap((sub) => sub.skills.map((k) => [k.id, LEVEL_LABEL[k.level]])));
        return [s.display_name, String(profile.stars), String(profile.completedChapterIds.length), ...skills.map((k) => levels[k.id] ?? '')];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cls.name.replace(/\W+/g, '_')}_progress.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printLoginCards = () => {
    const cards = students
      .map((s) => {
        const pic = revealed[s.id];
        return `<div class="q"><b>${esc(s.avatar ?? '')} ${esc(s.display_name)}</b>Class code: <b>${esc(cls.class_code)}</b><br>Secret pictures: <span style="font-size:26px">${
          pic ? esc(pic) : '(reset to show)'
        }</span></div>`;
      })
      .join('');
    printInFrame(`${cls.name} sign-in cards`, `<h1>${esc(cls.name)} — sign-in cards</h1><div class="meta">Cut out and give each child their card.</div>${cards}`);
  };

  const signInLink = `${window.location.origin}${window.location.pathname}#/student?code=${cls.class_code}`;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {cls.name} <span className="text-sm text-slate-400">({cls.board})</span>
            </h2>
            <p className="text-sm text-slate-300">
              Class code <span className="font-mono text-2xl font-black text-cyan-300 tracking-widest">{cls.class_code}</span>
            </p>
            <p className="text-xs text-slate-400 break-all">Children sign in at: {signInLink}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryBtn} onClick={printLoginCards} disabled={!students.length}>
              🖨️ Sign-in cards
            </button>
            <button type="button" className={secondaryBtn} onClick={exportHpcCsv} disabled={!students.length}>
              ⬇️ Progress CSV (for HPC)
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold"
              onClick={() =>
                confirm(`Delete ${cls.name}, its children and their progress?`) &&
                guard(async () => {
                  const client = await getClient();
                  const { error: err } = await client.from('classes').delete().eq('id', cls.id);
                  if (err) throw new Error(err.message);
                  onDeleted();
                })
              }
            >
              Delete class
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card>
          <h3 className="text-base font-extrabold text-white">
            Children ({students.length}/{maxStudents === Infinity ? '∞' : maxStudents})
          </h3>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="First name" className={inputCls} maxLength={30} />
            <button type="button" className={primaryBtn} disabled={!newName.trim() || students.length >= maxStudents} onClick={() => void addStudent()}>
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Each child gets 3 secret pictures. They’re shown only once — print the sign-in cards or note them down. You can reset them any time.
          </p>
          {summaries.map(({ s, profile }) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-sm">
              <span className="text-white">
                {s.avatar} {s.display_name}
                <span className="text-slate-400"> • ⭐{profile.stars} • {profile.completedChapterIds.length} lessons</span>
                {revealed[s.id] && <span className="ml-2 text-xl">{revealed[s.id]}</span>}
              </span>
              <div className="flex gap-1.5">
                <button type="button" className={secondaryBtn} onClick={() => void resetPicture(s)}>
                  New pictures
                </button>
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={() =>
                    confirm(`Remove ${s.display_name} and their progress?`) &&
                    guard(async () => {
                      const client = await getClient();
                      const { error: err } = await client.from('class_students').delete().eq('id', s.id);
                      if (err) throw new Error(err.message);
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="text-base font-extrabold text-white">Assigned lessons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
            <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className={inputCls}>
              {sortForBoard(CLASS1_CHAPTERS, cls.board).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <input type="date" value={dueOn} onChange={(e) => setDueOn(e.target.value)} className={inputCls} />
            <button
              type="button"
              className={primaryBtn}
              onClick={() =>
                guard(async () => {
                  const client = await getClient();
                  const { error: err } = await client.from('assignments').insert({ class_id: cls.id, chapter_id: chapterId, due_on: dueOn || null });
                  if (err) throw new Error(err.message);
                })
              }
            >
              Assign
            </button>
          </div>
          {assignments.map((a) => {
            const ch = CLASS1_CHAPTERS.find((c) => c.id === a.chapter_id);
            const done = summaries.filter(({ profile }) => profile.completedChapterIds.includes(a.chapter_id)).length;
            return (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-sm">
                <span className="text-white">
                  {ch?.title ?? a.chapter_id}
                  <span className="text-slate-400">
                    {a.due_on ? ` • due ${new Date(a.due_on).toLocaleDateString('en-IN')}` : ''} • {done}/{students.length} done
                  </span>
                </span>
                <button
                  type="button"
                  className={secondaryBtn}
                  onClick={() =>
                    guard(async () => {
                      const client = await getClient();
                      const { error: err } = await client.from('assignments').delete().eq('id', a.id);
                      if (err) throw new Error(err.message);
                    })
                  }
                >
                  Remove
                </button>
              </div>
            );
          })}
        </Card>
      </div>

      {summaries.length > 0 && (
        <Card>
          <h3 className="text-base font-extrabold text-white">Class progress by subject</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-1.5 pr-3">Child</th>
                  {summaries[0].subjects.map((sub) => (
                    <th key={sub.subject} className="py-1.5 pr-3">
                      {SUBJECT_LABELS[sub.subject]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaries.map(({ s, subjects }) => (
                  <tr key={s.id} className="border-t border-slate-800 text-slate-200">
                    <td className="py-1.5 pr-3 font-semibold">{s.display_name}</td>
                    {subjects.map((sub) => {
                      const secure = sub.skills.filter((k) => k.level === 'proficient').length;
                      const tried = sub.skills.filter((k) => k.level !== 'not-started').length;
                      return (
                        <td key={sub.subject} className="py-1.5 pr-3">
                          {secure}/{sub.skills.length} secure{tried ? ` • ${tried} tried` : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <ErrorText error={error} />
    </div>
  );
};

export const ClassroomPage: React.FC = () => {
  const session = useSession();
  const { plan, limits } = usePlan();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (session.status !== 'signed-in' || !limits.teacherTools) return;
    const client = await getClient();
    const { data } = await client.from('classes').select('id, name, board, class_code, created_at').eq('teacher_id', session.userId).order('created_at');
    const rows = (data ?? []) as ClassRow[];
    setClasses(rows);
    setActiveId((cur) => cur ?? rows[0]?.id ?? null);
  }, [session.status, session.userId, limits.teacherTools]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = classes.find((c) => c.id === activeId);

  return (
    <PageShell title="Classroom" subtitle="Classes, sign-in cards, assignments and class reports">
      <GrownUpGate reason="The classroom is for teachers.">
        {session.status !== 'signed-in' ? (
          <Card className="max-w-lg">
            <p className="text-sm text-slate-200">Sign in as a teacher to use the Classroom.</p>
            <button type="button" className={primaryBtn} onClick={() => openPage('account')}>
              Sign in
            </button>
          </Card>
        ) : !limits.teacherTools ? (
          <UpgradeNotice feature="The Classroom" plan="classroom" />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-extrabold border ${
                    c.id === activeId ? 'bg-cyan-500 text-slate-950 border-white' : 'bg-[#090D16] text-slate-300 border-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
              <button type="button" onClick={() => setActiveId('new')} className={secondaryBtn}>
                + New class
              </button>
            </div>
            {activeId === 'new' || classes.length === 0 ? (
              <CreateClass
                disabled={classes.length >= limits.maxClasses}
                onCreated={() => {
                  setActiveId(null);
                  void load();
                }}
              />
            ) : active ? (
              <ClassDetail
                key={active.id}
                cls={active}
                maxStudents={limits.maxStudentsPerClass}
                onDeleted={() => {
                  setActiveId(null);
                  void load();
                }}
              />
            ) : null}
            {classes.length >= limits.maxClasses && (
              <p className="text-xs text-slate-400">
                {PLANS[plan].name} allows {limits.maxClasses} classes. The School plan has no class limit.
              </p>
            )}
          </div>
        )}
      </GrownUpGate>
    </PageShell>
  );
};
