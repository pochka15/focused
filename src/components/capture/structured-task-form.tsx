import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  formatCapturedTask,
  useCaptureStore,
  type CapturedTaskCompletion,
  type CapturedTaskEnergy,
  type CapturedTaskScope,
  type CapturedTaskSize,
  type CapturedTaskUrgency,
} from "@/lib/stores/capture-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { cn } from "@/lib/random/utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  scope: z.enum(["work", "personal"]),
  urgency: z.enum(["next", "few-hours", "today"]),
  size: z.enum(["quick", "medium", "big"]),
  energy: z.enum(["deep", "normal", "light"]),
  completion: z.enum(["final", "splittable"]),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  description: "",
  scope: "work",
  urgency: "next",
  size: "medium",
  energy: "deep",
  completion: "final",
};

// Row 1 (top keyboard row): scope=q,w  urgency=e,r,t
const scopeOptions: [CapturedTaskScope, string, string][] = [
  ["work", "Work", "q"],
  ["personal", "Personal", "w"],
];

const urgencyOptions: [CapturedTaskUrgency, string, string][] = [
  ["next", "Next", "e"],
  ["few-hours", "Few hours", "r"],
  ["today", "Today anytime", "t"],
];

// Row 2 (middle keyboard row): size=a,s,d  energy=j,k,l
const sizeOptions: [CapturedTaskSize, string, string][] = [
  ["quick", "Quick <30m", "a"],
  ["medium", "Medium 1-2h", "s"],
  ["big", "Big 2h+", "d"],
];

const energyOptions: [CapturedTaskEnergy, string, string][] = [
  ["deep", "Deep focus", "j"],
  ["normal", "Normal", "k"],
  ["light", "Light", "l"],
];

// Row 3 (bottom keyboard row): completion=z,x
const completionOptions: [CapturedTaskCompletion, string, string][] = [
  ["final", "Final", "z"],
  ["splittable", "Splittable", "x"],
];

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

export const StructuredTaskForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);

  const consumeNextId = useCaptureStore((s) => s.consumeNextId);
  const backlog = usePlanningStore((s) => s.backlog);
  const setBacklog = usePlanningStore((s) => s.setBacklog);

  const { enabled } = useShortcutsMode("structuredTask");

  const form = useForm({
    defaultValues,
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      const id = consumeNextId();
      const formatted = formatCapturedTask({ ...value, id });
      const separator = backlog.trimEnd() ? "\n\n" : "";
      setBacklog(`${backlog.trimEnd()}${separator}${formatted}`);
      form.reset();
      disableModes(["structuredTask"]);
    },
  });

  const { disableModes } = useShortcuts({
    name: "structuredTask",
    enabled,
    keys: (key, event) => {
      if (key === "Escape") {
        disableModes(["structuredTask"]);
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

      if (
        document.activeElement === nameInputRef.current ||
        document.activeElement === descriptionInputRef.current
      ) {
        return true;
      }

      const scopeMatch = scopeOptions.find(([, , hint]) => hint === key);
      if (scopeMatch) {
        form.setFieldValue("scope", scopeMatch[0]);
        return true;
      }

      const urgencyMatch = urgencyOptions.find(([, , hint]) => hint === key);
      if (urgencyMatch) {
        form.setFieldValue("urgency", urgencyMatch[0]);
        return true;
      }

      const sizeMatch = sizeOptions.find(([, , hint]) => hint === key);
      if (sizeMatch) {
        form.setFieldValue("size", sizeMatch[0]);
        return true;
      }

      const energyMatch = energyOptions.find(([, , hint]) => hint === key);
      if (energyMatch) {
        form.setFieldValue("energy", energyMatch[0]);
        return true;
      }

      const completionMatch = completionOptions.find(
        ([, , hint]) => hint === key
      );
      if (completionMatch) {
        form.setFieldValue("completion", completionMatch[0]);
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
      <div className="flex">
        <form.Field
          name="name"
          children={(field) => (
            <Input
              data-focusable="true"
              autoComplete="off"
              ref={nameInputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="Task name"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        />
        <Button variant="ghost" type="submit" size="sm" className="shrink-0">
          Add
        </Button>
      </div>
      <form.Field
        name="description"
        children={(field) => (
          <Input
            data-focusable="true"
            autoComplete="off"
            ref={descriptionInputRef}
            id={field.name}
            name={field.name}
            value={field.state.value}
            placeholder="Description (optional)"
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <div className="flex flex-wrap gap-6">
        <form.Field
          name="scope"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Scope</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(v) =>
                  v && field.handleChange(v as CapturedTaskScope)
                }
              >
                {scopeOptions.map(([value, label, hint]) => (
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
          name="urgency"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Urgency</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(v) =>
                  v && field.handleChange(v as CapturedTaskUrgency)
                }
              >
                {urgencyOptions.map(([value, label, hint]) => (
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
        name="size"
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">Size</p>
            <ToggleGroup
              type="single"
              spacing={2}
              value={field.state.value}
              onValueChange={(v) =>
                v && field.handleChange(v as CapturedTaskSize)
              }
            >
              {sizeOptions.map(([value, label, hint]) => (
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
        name="completion"
        children={(field) => (
          <div className="flex flex-col gap-1.5">
            <p className="text-pink-500">Completion</p>
            <ToggleGroup
              type="single"
              spacing={2}
              value={field.state.value}
              onValueChange={(v) =>
                v && field.handleChange(v as CapturedTaskCompletion)
              }
            >
              {completionOptions.map(([value, label, hint]) => (
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
                v && field.handleChange(v as CapturedTaskEnergy)
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
    </form>
  );
};
