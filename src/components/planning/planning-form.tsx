import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/random/utils";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useTodosStore } from "@/lib/stores/todos-store";
import { findTag } from "@/lib/todos/mappings";
import type { Event, Task } from "@/lib/todos/todo-models";
import { isEvent, isTask } from "@/lib/todos/todo-utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { z } from "zod";

const schema = z.object({
  timeBlock: z.enum(["1h", "2h", "3h", "half-day"]),
  brainFuel: z.enum(["low", "med", "full"]),
  note: z.string(),
  goal: z.string(),
  aiMode: z.enum(["dictatorship", "democratic"]),
});

type FormValues = z.infer<typeof schema>;

const getDefaultValues = (goal: string): FormValues => ({
  timeBlock: "2h",
  brainFuel: "med",
  note: "",
  goal,
  aiMode: "dictatorship",
});

// Number row: time block=1,2,3,4
const timeBlockOptions: [FormValues["timeBlock"], string, string][] = [
  ["1h", "1h", "1"],
  ["2h", "2h", "2"],
  ["3h", "3h", "3"],
  ["half-day", "Half-day", "4"],
];

// Row 1 (top keyboard row): brainFuel=u,i,o
const brainFuelOptions: [FormValues["brainFuel"], string, string][] = [
  ["low", "Low", "u"],
  ["med", "Med", "i"],
  ["full", "Full", "o"],
];

// Row 2 (middle keyboard row): AI mode=a,s
const aiModeOptions: [FormValues["aiMode"], string, string][] = [
  ["dictatorship", "Dictatorship", "a"],
  ["democratic", "Democratic", "s"],
];

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

const formatTaskLine = (task: Task): string => {
  const tag = findTag(task.tag);
  return `- ${task.name}${tag ? `; ${tag.emoji}` : ""}`;
};

const formatEventLine = (event: Event): string =>
  `- [${event.rawTime}] ${event.name}`;

const buildPrompt = (values: FormValues, context: string, backlog: string): string => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [`Current time: ${currentTime}`, ""];
  lines.push(`I have ${values.timeBlock}, brain fuel: ${values.brainFuel}.`);
  if (values.note) lines.push(values.note);
  if (values.goal) lines.push(`Goal: ${values.goal}`);
  lines.push("");

  if (context) {
    lines.push(context, "");
  }

  if (backlog.trim()) {
    lines.push("Backlog:", backlog.trim(), "");
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

const buildContext = (completedTasks: Task[], allEvents: Event[]): string => {
  const parts: string[] = [];

  if (completedTasks.length > 0) {
    parts.push("Completed today:");
    completedTasks.forEach((t) => parts.push(formatTaskLine(t)));
  }

  if (allEvents.length > 0) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const pastEvents: Event[] = [];
    const upcomingEvents: Event[] = [];

    allEvents.forEach((e) => {
      const [h, m] = e.rawTime.split(":").map(Number);
      const eventMinutes = (h ?? 0) * 60 + (m ?? 0);
      if (eventMinutes <= currentMinutes) {
        pastEvents.push(e);
      } else {
        upcomingEvents.push(e);
      }
    });

    if (pastEvents.length > 0 || upcomingEvents.length > 0) {
      if (parts.length > 0) parts.push("");
      parts.push("Meetings:");
      pastEvents.forEach((e) => parts.push(`${formatEventLine(e)} (past)`));
      upcomingEvents.forEach((e) =>
        parts.push(`${formatEventLine(e)} (upcoming)`)
      );
    }
  }

  return parts.join("\n");
};

export const PlanningForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);
  const todos = useTodosStore((s) => s.todos);
  const goal = usePlanningStore((s) => s.goal);
  const setGoal = usePlanningStore((s) => s.setGoal);
  const backlog = usePlanningStore((s) => s.backlog);

  const { enabled } = useShortcutsMode("planningSession");

  const buildCurrentContext = () => {
    const completedTasks = todos.filter(isTask).filter((it) => it.completed);
    const allEvents = todos.filter(isEvent);
    return buildContext(completedTasks, allEvents);
  };

  const [contextPreview, setContextPreview] = useState(buildCurrentContext);

  const form = useForm({
    defaultValues: getDefaultValues(goal),
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      const prompt = buildPrompt(value, contextPreview, backlog);
      navigator.clipboard.writeText(prompt).catch(() => {});
      form.reset();
      setContextPreview(buildCurrentContext());
      disableModes(["planningSession"]);
    },
  });

  const handlePullContext = () => setContextPreview(buildCurrentContext());

  const { disableModes } = useShortcuts({
    name: "planningSession",
    enabled,
    keys: (key, event) => {
      if (key === "Escape") {
        disableModes(["planningSession"]);
        return true;
      }

      const direction = key === "ctrl+n" ? 1 : key === "ctrl+p" ? -1 : 0;
      if (direction) {
        const inputs = Array.from(
          formRef.current?.querySelectorAll(
            'input[data-focusable="true"], textarea[data-focusable="true"]'
          ) || []
        ) as (HTMLInputElement | HTMLTextAreaElement)[];
        inputsCounter.current += direction;
        inputs[inputsCounter.current % inputs.length]?.focus();
        event.preventDefault();
        return true;
      }

      if (
        (document.activeElement === noteInputRef.current ||
          document.activeElement === goalInputRef.current) &&
        key !== "Enter"
      ) {
        return true;
      }

      const timeMatch = timeBlockOptions.find(([, , hint]) => hint === key);
      if (timeMatch) {
        form.setFieldValue("timeBlock", timeMatch[0]);
        return true;
      }

      const brainFuelMatch = brainFuelOptions.find(([, , hint]) => hint === key);
      if (brainFuelMatch) {
        form.setFieldValue("brainFuel", brainFuelMatch[0]);
        return true;
      }

      const aiMatch = aiModeOptions.find(([, , hint]) => hint === key);
      if (aiMatch) {
        form.setFieldValue("aiMode", aiMatch[0]);
        return true;
      }

      if (key === "Enter") {
        event.preventDefault();
        form.handleSubmit();
        return true;
      }

      return true;
    },
  });

  return (
    <form
      ref={formRef}
      className={cn("flex flex-col gap-4", !enabled && "hidden")}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <div className="flex flex-wrap gap-6">
        <form.Field
          name="timeBlock"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Time block</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(v) =>
                  v && field.handleChange(v as FormValues["timeBlock"])
                }
              >
                {timeBlockOptions.map(([value, label, hint]) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    aria-label={value}
                    className="relative"
                  >
                    <span>{label}</span>
                    <span className={hintStyles}>{hint}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        />

        <form.Field
          name="brainFuel"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Brain fuel</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(v) =>
                  v && field.handleChange(v as FormValues["brainFuel"])
                }
              >
                {brainFuelOptions.map(([value, label, hint]) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    aria-label={value}
                    className="relative"
                  >
                    <span>{label}</span>
                    <span className={hintStyles}>{hint}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
        />
      </div>

      <form.Field
        name="aiMode"
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">AI mode</p>
            <ToggleGroup
              type="single"
              spacing={2}
              value={field.state.value}
              onValueChange={(v) =>
                v && field.handleChange(v as FormValues["aiMode"])
              }
            >
              {aiModeOptions.map(([value, label, hint]) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={value}
                  className="relative"
                >
                  <span>{label}</span>
                  <span className={hintStyles}>{hint}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      />

      <form.Field
        name="note"
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">Note for AI (optional)</p>
            <Input
              data-focusable="true"
              autoComplete="off"
              ref={noteInputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="e.g. finishing in 2h, skip deep tasks"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />

      <form.Field
        name="goal"
        listeners={{ onChange: ({ value }) => setGoal(value) }}
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">Goal (optional)</p>
            <Input
              data-focusable="true"
              autoComplete="off"
              ref={goalInputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="What do you want to achieve?"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-pink-500">Context</p>
          <Button type="button" variant="ghost" size="sm" onClick={handlePullContext}>
            Refresh
          </Button>
        </div>
        {contextPreview && (
          <pre className="bg-muted text-muted-foreground rounded p-2 font-mono text-xs whitespace-pre-wrap">
            {contextPreview}
          </pre>
        )}
      </div>

      {backlog.trim() && (
        <div className="flex flex-col gap-1.5">
          <p className="text-pink-500">Backlog</p>
          <pre className="bg-muted text-muted-foreground max-h-40 overflow-y-auto rounded p-2 font-mono text-xs whitespace-pre-wrap">
            {backlog}
          </pre>
        </div>
      )}

      <Button type="submit" variant="ghost" className="gap-1 self-end">
        Copy prompt
      </Button>
    </form>
  );
};
