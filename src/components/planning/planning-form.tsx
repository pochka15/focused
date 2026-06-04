import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/random/utils";
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
  energy: z.enum(["tired", "normal", "focused"]),
  goal: z.string(),
  aiMode: z.enum(["dictatorship", "democratic"]),
  backlog: z.string(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  timeBlock: "2h",
  energy: "normal",
  goal: "",
  aiMode: "dictatorship",
  backlog: "",
};

// Number row: time block=1,2,3,4
const timeBlockOptions: [FormValues["timeBlock"], string, string][] = [
  ["1h", "1h", "1"],
  ["2h", "2h", "2"],
  ["3h", "3h", "3"],
  ["half-day", "Half-day", "4"],
];

// Row 1 (top keyboard row): energy=u,i,o
const energyOptions: [FormValues["energy"], string, string][] = [
  ["tired", "Tired", "u"],
  ["normal", "Normal", "i"],
  ["focused", "Focused", "o"],
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

const buildPrompt = (values: FormValues, context: string): string => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [`Current time: ${currentTime}`, ""];
  lines.push(`I have ${values.timeBlock}, energy: ${values.energy}.`);
  if (values.goal) lines.push(`Goal: ${values.goal}`);
  lines.push("");

  if (context) {
    lines.push(context, "");
  }

  if (values.backlog.trim()) {
    lines.push("Backlog:", values.backlog.trim(), "");
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
  const goalInputRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);
  const [contextPreview, setContextPreview] = useState("");

  const todos = useTodosStore((s) => s.todos);

  const { enabled } = useShortcutsMode("planningSession");

  const form = useForm({
    defaultValues,
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      const prompt = buildPrompt(value, contextPreview);
      navigator.clipboard.writeText(prompt).catch(() => {});
      form.reset();
      setContextPreview("");
      disableModes(["planningSession"]);
    },
  });

  const handlePullContext = () => {
    const completedTasks = todos
      .filter((it) => isTask(it))
      .filter((it) => it.completed);
    const allEvents = todos.filter(isEvent);
    setContextPreview(buildContext(completedTasks, allEvents));
  };

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
          formRef.current?.querySelectorAll('input[data-focusable="true"]') ||
            []
        ) as HTMLInputElement[];
        inputsCounter.current += direction;
        inputs[inputsCounter.current % inputs.length]?.focus();
        event.preventDefault();
        return true;
      }

      if (document.activeElement === goalInputRef.current && key !== "Enter") {
        return true;
      }

      const timeMatch = timeBlockOptions.find(([, , hint]) => hint === key);
      if (timeMatch) {
        form.setFieldValue("timeBlock", timeMatch[0]);
        return true;
      }

      const energyMatch = energyOptions.find(([, , hint]) => hint === key);
      if (energyMatch) {
        form.setFieldValue("energy", energyMatch[0]);
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
          name="energy"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Energy</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(v) =>
                  v && field.handleChange(v as FormValues["energy"])
                }
              >
                {energyOptions.map(([value, label, hint]) => (
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

      <div className="flex items-end gap-2">
        <form.Field
          name="goal"
          children={(field) => (
            <div className="flex flex-1 flex-col gap-1.5">
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
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-pink-500">Context</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePullContext}
          >
            Pull from tasks
          </Button>
        </div>
        {contextPreview && (
          <pre className="bg-muted text-muted-foreground rounded p-2 font-mono text-xs whitespace-pre-wrap">
            {contextPreview}
          </pre>
        )}
      </div>

      <form.Field
        name="backlog"
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">Backlog</p>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="Paste your structured tasks here..."
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
              rows={5}
            />
          </div>
        )}
      />

      <Button type="submit" variant="ghost" className="gap-1 self-end">
        Copy prompt
      </Button>
    </form>
  );
};
