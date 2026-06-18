import { el } from "./dom";
import { store } from "./store";
import type { NoteScope } from "./types";

/**
 * An independent free-text note for a given scope+key. Saves on input (debounced
 * lightly via the browser's own batching is unnecessary — localStorage writes
 * are cheap at this size). Day/week/month notes never roll up into each other.
 */
export function noteEditor(scope: NoteScope, key: string, label: string): HTMLElement {
  const ta = el("textarea", {
    class: "note",
    placeholder: `${label} note…`,
    rows: 3,
  }) as HTMLTextAreaElement;
  ta.value = store.note(scope, key);
  ta.addEventListener("input", () => store.setNote(scope, key, ta.value));

  return el("div", { class: "note-block" }, [
    el("span", { class: "note-label" }, [`${label} note`]),
    ta,
  ]);
}
