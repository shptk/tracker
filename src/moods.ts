import type { Mood, MoodKey } from "./types";

// Fixed mood palette. Confirmed with the user:
//   green=good, red=angry, gray=sad, amber=anxious, blue=calm, purple=tired.
// To add a mood later: add a MoodKey in types.ts and an entry here — the
// year view and cycle logic pick it up automatically.
export const MOODS: Mood[] = [
  { key: "good", label: "Good", color: "#4ade80", emoji: "🟢" },
  { key: "angry", label: "Angry", color: "#f87171", emoji: "🔴" },
  { key: "sad", label: "Sad", color: "#9ca3af", emoji: "⚪" },
  { key: "anxious", label: "Anxious", color: "#fbbf24", emoji: "🟡" },
  { key: "calm", label: "Calm", color: "#60a5fa", emoji: "🔵" },
  { key: "tired", label: "Tired", color: "#a78bfa", emoji: "🟣" },
];

export const MOOD_ORDER: MoodKey[] = MOODS.map((m) => m.key);

const MOOD_BY_KEY = new Map<MoodKey, Mood>(MOODS.map((m) => [m.key, m]));

export function moodOf(key: MoodKey | undefined): Mood | undefined {
  return key ? MOOD_BY_KEY.get(key) : undefined;
}

/**
 * Cycle a day's mood on click: none → first → … → last → none.
 * Returns the next mood key, or undefined to clear the day.
 */
export function nextMood(current: MoodKey | undefined): MoodKey | undefined {
  if (current === undefined) return MOOD_ORDER[0];
  const i = MOOD_ORDER.indexOf(current);
  if (i === -1 || i === MOOD_ORDER.length - 1) return undefined;
  return MOOD_ORDER[i + 1];
}
