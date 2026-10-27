import { useSyncExternalStore } from 'react';
// Shared text-to-speech helper.
// - Picks a voice that actually matches the language (hi-IN text is not read by an English voice).
// - Strips emoji so the voice does not read out "crescent moon" or "sparkles".
// - Respects the global Voice ON/OFF preference unless `force` is set.

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu;
const DEVANAGARI = /[ऀ-ॿ]/;

export type SpeechLang = 'en-IN' | 'hi-IN';

const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

let voices: SpeechSynthesisVoice[] = [];
const loadVoices = () => {
  if (supported()) voices = window.speechSynthesis.getVoices();
};
if (supported()) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

let voiceEnabled = true;
export const setSpeechEnabled = (on: boolean) => {
  voiceEnabled = on;
  if (!on) cancelSpeech();
};
export const isSpeechEnabled = () => voiceEnabled;

export const hasDevanagari = (text: string) => DEVANAGARI.test(text);

export const cleanForSpeech = (text: string) =>
  text.replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim();

const normalise = (lang: string) => lang.replace('_', '-').toLowerCase();

export const pickVoice = (lang: SpeechLang): SpeechSynthesisVoice | undefined => {
  const want = normalise(lang);
  const base = want.split('-')[0];
  return (
    voices.find((v) => normalise(v.lang) === want) ||
    voices.find((v) => normalise(v.lang).startsWith(base))
  );
};

/** True when the device has a voice for this language (or voices have not loaded yet). */
export const hasVoiceFor = (lang: SpeechLang) => voices.length === 0 || Boolean(pickVoice(lang));

export const cancelSpeech = () => {
  if (supported()) window.speechSynthesis.cancel();
};

interface SpeakOptions {
  lang?: SpeechLang;
  rate?: number;
  pitch?: number;
  /** Add to the queue instead of interrupting what is being said. */
  queue?: boolean;
  /** Speak even when Voice is OFF (used for explicit "read aloud" taps). */
  force?: boolean;
}

export const speakText = (text: string, opts: SpeakOptions = {}) => {
  if (!supported() || (!voiceEnabled && !opts.force)) return;
  const clean = cleanForSpeech(text);
  if (!clean) return;
  const lang: SpeechLang = opts.lang ?? (hasDevanagari(clean) ? 'hi-IN' : 'en-IN');
  if (!opts.queue) window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = lang;
  const voice = pickVoice(lang);
  if (voice) u.voice = voice;
  u.rate = opts.rate ?? 0.92;
  u.pitch = opts.pitch ?? 1.08;
  window.speechSynthesis.speak(u);
};

const subscribeVoices = (cb: () => void) => {
  if (!supported()) return () => undefined;
  const handler = () => {
    loadVoices();
    cb();
  };
  window.speechSynthesis.addEventListener?.('voiceschanged', handler);
  return () => window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
};

/** Re-renders when the device's voice list loads, so "no Hindi voice" notices are accurate. */
export const useHasVoice = (lang: SpeechLang) =>
  useSyncExternalStore(subscribeVoices, () => supported() && hasVoiceFor(lang), () => true);
