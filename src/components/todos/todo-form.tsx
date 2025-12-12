import { Input } from "@/components/ui/input";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { cn } from "@/lib/random/utils";
import { getDefaultTodo, todoSchema } from "@/lib/schemas/todo-schema";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTodosStore } from "@/lib/stores/todos-store";
import type { Task } from "@/lib/todos/todo-models";
import { findKey } from "lodash";
import { ArrowRight } from "lucide-react";
import { modes as importedModes, tags as importedTags } from "./todo-table-row";

const urgencyLvl: Record<Task["urgencyLvl"], [string, string]> = {
  urgent: ["🔥 Горит", "A"],
  evening: ["Не горит", "S"],
  normal: ["Можно потом", "D"],
};

const tags: Record<Task["tag"], [string, string]> = {
  "just-do-it": [importedTags["just-do-it"], "J"],
  "nicely-done": [importedTags["nicely-done"], "K"],
  garbage: [importedTags.garbage, "L"],
};

const modes: Record<Task["mode"], [string, string]> = {
  deep: [importedModes.deep, "F"],
  light: [importedModes.light, "G"],
};

export const TodoForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const addTask = useTodosStore((s) => s.addTask);

  const { sendEvent, isActive } = useNuphy({
    name: "addTodo",
    keyHandler: (key) => {
      if (document.activeElement === inputRef.current) {
        if (key === "Escape") {
          sendEvent({
            name: "set-add-todo-mode",
            data: { isActive: false },
          });
          return true;
        }
        return true;
      }

      if (key === "Escape") {
        sendEvent({ name: "set-add-todo-mode", data: { isActive: false } });
        return true;
      }

      const findKeyByHint = (obj: Record<string, [string, string]>) =>
        findKey(obj, ([_, hint]) => hint.toLowerCase() === key);

      const urgencyKey = findKeyByHint(urgencyLvl);
      if (urgencyKey) {
        form.setFieldValue("urgencyLvl", urgencyKey as Task["urgencyLvl"]);
        return true;
      }

      const tagKey = findKeyByHint(tags);
      if (tagKey) {
        form.setFieldValue("tag", tagKey as Task["tag"]);
        return true;
      }

      const modeKey = findKeyByHint(modes);
      if (modeKey) {
        form.setFieldValue("mode", modeKey as Task["mode"]);
        return true;
      }

      if (key === "Enter") {
        form.handleSubmit();
        return true;
      }

      return false;
    },
  });

  const form = useForm({
    defaultValues: getDefaultTodo(),
    validators: { onChange: todoSchema },
    onSubmit: (res) => {
      addTask(res.value);
      form.resetField("name");
      inputRef.current?.focus();
    },
  });

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
      setReady(true);
    } else if (!isActive) setReady(false);
  }, [isActive]);

  const hintStyles =
    "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

  return (
    <form
      className={cn("flex flex-col gap-2", !isActive && "hidden")}
      onSubmit={(v) => {
        v.preventDefault();
        form.handleSubmit(v);
      }}
    >
      <div className="flex">
        <form.Field
          name="name"
          children={(field) => (
            <Input
              autoComplete="off"
              ref={inputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                if (ready) field.handleChange(e.target.value);
              }}
            />
          )}
        />
        <Button variant="ghost" type="submit" size="icon">
          <ArrowRight className="size-4 h-full" />
        </Button>
      </div>

      <form.Field
        name="urgencyLvl"
        children={(field) => (
          <ToggleGroup
            type="single"
            spacing={2}
            value={field.state.value}
            onValueChange={(it) => field.handleChange(it as any)}
          >
            {Object.entries(urgencyLvl).map(([value, [label, hint]]) => (
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
        )}
      />

      <form.Field
        name="tag"
        children={(field) => (
          <ToggleGroup
            type="single"
            spacing={2}
            value={field.state.value}
            onValueChange={(it) => field.handleChange(it as any)}
          >
            {Object.entries(tags).map(([value, [label, hint]]) => (
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
        )}
      />

      <form.Field
        name="mode"
        children={(field) => (
          <ToggleGroup
            type="single"
            spacing={2}
            value={field.state.value}
            onValueChange={(it) => field.handleChange(it as any)}
          >
            {Object.entries(modes).map(([value, [label, hint]]) => (
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
        )}
      />
    </form>
  );
};
