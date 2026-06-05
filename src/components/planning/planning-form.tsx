import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  buildPlanningContext,
  buildPlanningPrompt,
} from "@/lib/random/prompts";
import { cn } from "@/lib/random/utils";
import { formatBacklogTask } from "@/lib/stores/capture-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useTodosStore } from "@/lib/stores/todos-store";
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
  timeBlock: "1h",
  brainFuel: "full",
  note: "",
  goal,
  aiMode: "dictatorship",
});

const timeBlockOptions: [FormValues["timeBlock"], string, string][] = [
  ["1h", "1h", "1"],
  ["2h", "2h", "2"],
  ["3h", "3h", "3"],
  ["half-day", "Half-day", "4"],
];

const brainFuelOptions: [FormValues["brainFuel"], string, string][] = [
  ["low", "Low", "u"],
  ["med", "Med", "i"],
  ["full", "Full", "o"],
];

const aiModeOptions: [FormValues["aiMode"], string, string][] = [
  ["dictatorship", "Dictatorship", "a"],
  ["democratic", "Democratic", "s"],
];

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

export const PlanningForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);
  const todos = useTodosStore((s) => s.todos);
  const goal = usePlanningStore((s) => s.goal);
  const setGoal = usePlanningStore((s) => s.setGoal);
  const tasks = usePlanningStore((s) => s.tasks);

  const { enabled } = useShortcutsMode("planningSession");

  const buildCurrentContext = () => buildPlanningContext(todos);

  const [contextPreview, setContextPreview] = useState(buildCurrentContext);

  const form = useForm({
    defaultValues: getDefaultValues(goal),
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      const backlog = tasks.map(formatBacklogTask).join("\n\n");
      const prompt = buildPlanningPrompt(value, contextPreview, backlog);
      navigator.clipboard.writeText(prompt).catch(() => {});
      form.reset();
      setContextPreview(buildCurrentContext());
      disableModes(["planningSession"]);
    },
  });

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

      const brainFuelMatch = brainFuelOptions.find(
        ([, , hint]) => hint === key
      );
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

      <Button type="submit" variant="ghost" className="gap-1 self-end">
        Copy prompt
      </Button>
    </form>
  );
};
