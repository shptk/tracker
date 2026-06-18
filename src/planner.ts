import { clear, el } from "./dom";
import { store } from "./store";
import { noteEditor } from "./notes";
import type { Task } from "./types";
import {
  addDays,
  dayKey,
  dayLabel,
  isSameDay,
  monthGrid,
  monthKey,
  monthName,
  parseDayKey,
  startOfWeek,
  today,
  weekDates,
  weekKey,
  weekdayShort,
} from "./dates";

type Sub = "day" | "week" | "month";

export interface View {
  el: HTMLElement;
  destroy(): void;
}

/** A single task row: checkbox, editable text, delete. */
function taskRow(task: Task): HTMLElement {
  const checkbox = el("input", {
    type: "checkbox",
    class: "task-check",
    checked: task.done,
    onChange: () => store.toggleTask(task.id),
  });

  const text = el("span", {
    class: task.done ? "task-text done" : "task-text",
    title: "Double-click to edit",
  }, [task.text]);

  text.addEventListener("dblclick", () => {
    const input = el("input", {
      type: "text",
      class: "task-edit",
      value: task.text,
    }) as HTMLInputElement;
    const commit = () => store.editTask(task.id, input.value);
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Enter") input.blur();
      if ((e as KeyboardEvent).key === "Escape") {
        input.value = task.text;
        input.blur();
      }
    });
    text.replaceWith(input);
    input.focus();
    input.select();
  });

  const del = el("button", {
    class: "task-del",
    title: "Delete",
    "aria-label": "Delete task",
    onClick: () => store.deleteTask(task.id),
  }, ["×"]);

  return el("li", { class: "task" }, [checkbox, text, del]);
}

/** Add-task input bound to a specific day key. */
function addTaskInput(dateKey: string): HTMLElement {
  const input = el("input", {
    type: "text",
    class: "task-add",
    placeholder: "Add a task…",
  }) as HTMLInputElement;
  input.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter" && input.value.trim()) {
      store.addTask(dateKey, input.value);
      input.value = "";
    }
  });
  return input;
}

function taskList(dateKey: string): HTMLElement {
  const tasks = store.tasksForDay(dateKey);
  const list = el("ul", { class: "task-list" }, tasks.map(taskRow));
  return list;
}

export function createPlanner(): View {
  let sub: Sub = "day";
  let cursor = today();

  const root = el("section", { class: "planner" });
  const subtabs = el("div", { class: "subtabs" });
  const nav = el("div", { class: "nav" });
  const body = el("div", { class: "planner-body" });
  root.append(subtabs, nav, body);

  function renderSubtabs(): void {
    clear(subtabs);
    (["day", "week", "month"] as Sub[]).forEach((s) => {
      subtabs.append(
        el("button", {
          class: s === sub ? "subtab active" : "subtab",
          onClick: () => {
            sub = s;
            render();
          },
        }, [s[0].toUpperCase() + s.slice(1)]),
      );
    });
  }

  function step(dir: number): void {
    if (sub === "day") cursor = addDays(cursor, dir);
    else if (sub === "week") cursor = addDays(cursor, dir * 7);
    else cursor = new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
    render();
  }

  function renderNav(): void {
    clear(nav);
    let label = "";
    if (sub === "day") label = dayLabel(cursor);
    else if (sub === "week") {
      const wd = weekDates(cursor);
      label = `${dayLabel(wd[0])} – ${dayLabel(wd[6])}`;
    } else label = `${monthName(cursor.getMonth())} ${cursor.getFullYear()}`;

    nav.append(
      el("button", { class: "nav-btn", title: "Previous", onClick: () => step(-1) }, ["‹"]),
      el("button", {
        class: "nav-btn today",
        onClick: () => {
          cursor = today();
          render();
        },
      }, ["Today"]),
      el("button", { class: "nav-btn", title: "Next", onClick: () => step(1) }, ["›"]),
      el("span", { class: "nav-label" }, [label]),
    );
  }

  function renderDay(): void {
    const key = dayKey(cursor);
    body.append(
      el("div", { class: "day-pane" }, [
        addTaskInput(key),
        taskList(key),
        noteEditor("day", key, "Day"),
      ]),
    );
  }

  function renderWeek(): void {
    const grid = el("div", { class: "week-grid" });
    for (const d of weekDates(cursor)) {
      const key = dayKey(d);
      const head = el("div", {
        class: isSameDay(d, today()) ? "week-day-head is-today" : "week-day-head",
      }, [`${weekdayShort((d.getDay() + 6) % 7)} ${d.getDate()}`]);
      grid.append(
        el("div", { class: "week-col" }, [
          head,
          taskList(key),
          addTaskInput(key),
        ]),
      );
    }
    body.append(grid, noteEditor("week", weekKey(startOfWeek(cursor)), "Week"));
  }

  function renderMonth(): void {
    const grid = el("div", { class: "month-grid" });
    for (const wd of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      grid.append(el("div", { class: "month-dow" }, [wd]));
    }
    for (const d of monthGrid(cursor)) {
      const key = dayKey(d);
      const inMonth = d.getMonth() === cursor.getMonth();
      const tasks = store.tasksForDay(key);
      const open = tasks.filter((t) => !t.done).length;
      const cell = el("button", {
        class: [
          "month-cell",
          inMonth ? "" : "other-month",
          isSameDay(d, today()) ? "is-today" : "",
        ].filter(Boolean).join(" "),
        title: tasks.length ? `${tasks.length} task(s)` : "Open day",
        onClick: () => {
          sub = "day";
          cursor = parseDayKey(key);
          render();
        },
      }, [
        el("span", { class: "month-cell-num" }, [String(d.getDate())]),
        ...(tasks.length
          ? [el("span", { class: open ? "month-cell-dot open" : "month-cell-dot" }, [
              open ? String(open) : "✓",
            ])]
          : []),
      ]);
      grid.append(cell);
    }
    body.append(grid, noteEditor("month", monthKey(cursor), "Month"));
  }

  function render(): void {
    renderSubtabs();
    renderNav();
    clear(body);
    if (sub === "day") renderDay();
    else if (sub === "week") renderWeek();
    else renderMonth();
  }

  const unsubscribe = store.subscribe(render);
  render();

  return {
    el: root,
    destroy: unsubscribe,
  };
}
