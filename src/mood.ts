import { clear, el } from "./dom";
import { store } from "./store";
import { MOODS, moodOf, nextMood } from "./moods";
import { dayKey, isSameDay, monthName, today } from "./dates";
import type { View } from "./planner";

/** One month's mini-calendar of day boxes. */
function monthBlock(year: number, month0: number): HTMLElement {
  const first = new Date(year, month0, 1);
  const lead = (first.getDay() + 6) % 7; // Mon-start offset
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const now = today();

  const boxes = el("div", { class: "mood-days" });

  // Leading blanks to align the 1st under the right weekday.
  for (let i = 0; i < lead; i++) {
    boxes.append(el("span", { class: "mood-box blank" }));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month0, day);
    const key = dayKey(d);
    const mood = moodOf(store.mood(key));
    const box = el("button", {
      class: isSameDay(d, now) ? "mood-box is-today" : "mood-box",
      title: `${key}${mood ? ` · ${mood.label}` : ""} — click to cycle`,
      "aria-label": `${key}${mood ? `, ${mood.label}` : ""}`,
      onClick: () => store.setMood(key, nextMood(store.mood(key))),
    });
    if (mood) box.style.backgroundColor = mood.color;
    boxes.append(box);
  }

  return el("div", { class: "mood-month" }, [
    el("div", { class: "mood-month-name" }, [monthName(month0)]),
    boxes,
  ]);
}

function legend(): HTMLElement {
  return el(
    "div",
    { class: "legend" },
    MOODS.map((m) =>
      el("span", { class: "legend-item" }, [
        el("span", { class: "legend-swatch", style: `background:${m.color}` }),
        el("span", {}, [m.label]),
      ]),
    ),
  );
}

export function createMood(): View {
  let year = today().getFullYear();

  const root = el("section", { class: "mood" });
  const header = el("div", { class: "mood-header" });
  const grid = el("div", { class: "mood-grid" });
  root.append(header, grid);

  function render(): void {
    clear(header);
    header.append(
      el("div", { class: "nav" }, [
        el("button", { class: "nav-btn", title: "Previous year", onClick: () => { year--; render(); } }, ["‹"]),
        el("button", { class: "nav-btn today", onClick: () => { year = today().getFullYear(); render(); } }, ["This year"]),
        el("button", { class: "nav-btn", title: "Next year", onClick: () => { year++; render(); } }, ["›"]),
        el("span", { class: "nav-label" }, [String(year)]),
      ]),
      legend(),
      el("p", { class: "hint" }, ["Click a day to cycle its mood; cycling past the last color clears it."]),
    );

    clear(grid);
    for (let m = 0; m < 12; m++) grid.append(monthBlock(year, m));
  }

  const unsubscribe = store.subscribe(render);
  render();

  return { el: root, destroy: unsubscribe };
}
