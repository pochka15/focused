import { findTag } from "@/lib/todos/mappings";
import type { Event, Task, TodoItem } from "@/lib/todos/todo-models";
import { isEvent, isTask } from "@/lib/todos/todo-utils";

export const BACKTICKS = "```";

const toCodeBlock = (value: string): string =>
  `${BACKTICKS}\n${value.trim()}\n${BACKTICKS}`;

export const AI_SETUP_PROMPT = `You are a planning assistant. I use you to help me decide what to work on next during a given time block.

Here is how I work:
- I keep a structured task backlog in a text file. Each task looks like:
    - #42 Fix auth refresh [work|next|medium|deep]
      - Optional description or context about the task
- Tags mean: scope (work/personal), urgency (next/few-hours/today), size (quick <30m / medium 1-2h / big 2h+), energy required (deep focus / normal / light), and optionally "splittable" if the task is ongoing work done in rounds (no fixed end in one session — schedule one round, then I'll create a follow-up if still WIP)
- I place tasks on a canvas and work through them. Completed tasks and past/upcoming meetings will be provided as context.
- I will tell you how much time I have (1h / 2h / 3h / half-day) and my brain fuel level (low / med / full).
- I may also tell you a note or a goal for the session.

When I ask for a plan, I will paste context in this format:
${BACKTICKS}
Current time: HH:MM
I have Xh, brain fuel: [low/med/full].
Goal for today: ...

Completed today: ...
Meetings: ...
Backlog: ...
${BACKTICKS}

Respond according to the mode I specify:

- Dictatorship: output exactly this format:
  - #N1 <task name>
  - #N2 <task name>
  (ordered list, task IDs and names only, no elaboration)

- Democratic: output exactly this format — first list all tasks mentioned across strategies, then the strategies:
  Mentioned tasks:
  - #N1 <task name>
  - #N2 <task name>
  - #N3 <task name>

  Strategies:
  - strategy A: #N1, #N2 — <one short sentence>
  - strategy B: #N2, #N3 — <one short sentence>

For the democratic response, prefer 1-2 strategies. 3 only if genuinely distinct. Short sentence like: "First - deep task then a small noisy one"

In both modes: if you notice a problem (too many tasks for the time, energy mismatch, meeting cutting the block short, etc.) add a single sentence at the very end starting with "note:" describing the issue. Otherwise omit it.`;

export type PlanningPromptValues = {
  timeBlock: "1h" | "2h" | "3h" | "half-day";
  brainFuel: "low" | "med" | "full";
  note: string;
  goal: string;
  aiMode: "dictatorship" | "democratic";
};

const formatTaskLine = (task: Task): string => {
  const tag = findTag(task.tag);
  return `- ${task.name}${tag ? `; ${tag.emoji}` : ""}`;
};

const formatEventLine = (event: Event): string =>
  `- [${event.rawTime}] ${event.name}`;

export const buildPlanningPrompt = (
  values: PlanningPromptValues,
  context: string,
  backlog: string
): string => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [`Current time: ${currentTime}`, ""];
  lines.push(`I have ${values.timeBlock}, brain fuel: ${values.brainFuel}.`);
  if (values.note) lines.push(values.note);
  if (values.goal) lines.push(`Goal for today: ${values.goal}`);
  lines.push("");

  if (context.trim()) {
    lines.push("Context:");
    lines.push(toCodeBlock(context), "");
  }

  if (backlog.trim()) {
    lines.push("Backlog:");
    lines.push(toCodeBlock(backlog), "");
  }

  if (values.aiMode === "dictatorship") {
    lines.push(
      "Tell me exactly what to work on during this time block. Be direct — no options, no caveats."
    );
  } else {
    lines.push(
      "Give me 2-3 strategies for this time block. For each: list tasks in order and explain in 1-2 sentences why this sequence makes sense."
    );
  }

  return lines.join("\n");
};

export const buildPlanningContext = (todos: TodoItem[]): string => {
  const parts: string[] = [];
  const completedTasks = todos.filter(isTask).filter((it) => it.completed);
  const allEvents = todos.filter(isEvent);

  if (completedTasks.length > 0) {
    parts.push("Completed today:");
    completedTasks.forEach((task) => parts.push(formatTaskLine(task)));
  }

  if (allEvents.length > 0) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const pastEvents: Event[] = [];
    const upcomingEvents: Event[] = [];

    allEvents.forEach((event) => {
      const [h, m] = event.rawTime.split(":").map(Number);
      const eventMinutes = (h ?? 0) * 60 + (m ?? 0);
      if (eventMinutes <= currentMinutes) {
        pastEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    if (pastEvents.length > 0 || upcomingEvents.length > 0) {
      if (parts.length > 0) parts.push("");
      parts.push("Meetings:");
      pastEvents.forEach((event) =>
        parts.push(`${formatEventLine(event)} (past)`)
      );
      upcomingEvents.forEach((event) =>
        parts.push(`${formatEventLine(event)} (upcoming)`)
      );
    }
  }

  return parts.join("\n");
};
