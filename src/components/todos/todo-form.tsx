import { Input } from "@/components/ui/input";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { cn } from "@/lib/random/utils";
import {
  autoFillNewTodoItem,
  autoFillTodoItem,
  fromTodoItem,
  getDefaultTodo,
  todoSchema,
  type FTodo,
} from "@/lib/schemas/todo-schema";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { useTodosStore } from "@/lib/stores/todos-store";
import {
  findTag,
  findTagByKey,
  orderedTags,
  pushFrontVariants,
  todoType,
} from "@/lib/todos/mappings";
import type { TodoItem } from "@/lib/todos/todo-models";
import { findKey } from "lodash";
import { ArrowRight } from "lucide-react";

const tags = orderedTags
  .map((it) => findTag(it))
  .filter((it) => it !== undefined);

const getDefaultValues = (editedTodo?: TodoItem, x = 0, y = 0) => {
  const base = editedTodo ? fromTodoItem(editedTodo) : getDefaultTodo();
  return { ...base, x: editedTodo?.x ?? x, y: editedTodo?.y ?? y };
};

export const TodoForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const eventRawTimeRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);

  const todos = useTodosStore((s) => s.todos);
  const addTodo = useTodosStore((s) => s.addTodo);
  const editTodo = useTodosStore((s) => s.editTodo);

  const { enabled, data: editedTodoData } = useNuphyMode("editingTodo");
  const editedId = editedTodoData?.id;
  const editedTodo = editedId
    ? todos.find((it) => it.id === editedId)
    : undefined;
  const { x, y } = editedTodoData?.spawnPosition ?? { x: 0, y: 0 };

  const form = useForm({
    defaultValues: getDefaultValues(editedTodo, x, y),
    validators: { onChange: todoSchema },
    onSubmit: (res) => {
      if (editedId) editTodo(autoFillTodoItem(editedId, res.value));
      else {
        addTodo(autoFillNewTodoItem(res.value), res.value.pushFront);
      }
      form.reset();
      disableModes(["editingTodo", "selectingTodos"]);
    },
  });

  const editingTask =
    useStore(form.store, (state) => state.values.todoKind) === "task";
  const editingEvent = !editingTask;

  const { disableModes } = useNuphy({
    name: "addTodo",
    enabled,
    keys: (key, event) => {
      if (key === "Escape") {
        disableModes(["editingTodo", "selectingTodos"]);
        return true;
      }

      const direction = key === "ctrl+n" ? 1 : key === "ctrl+p" ? -1 : 0;
      if (direction) {
        const inputs = Array.from(
          formRef.current?.querySelectorAll('input[data-focusable="true"]') ||
            []
        ) as HTMLInputElement[];
        inputsCounter.current += direction;
        if (inputs.length > 0) {
          inputs[inputsCounter.current % inputs.length]?.focus();
        }
        event.preventDefault();
      }

      if (document.activeElement === nameInputRef.current && key !== "Enter") {
        return true;
      }

      const findKeyByHint = (obj: Record<string, [string, string]>) =>
        findKey(obj, ([_, hint]) => hint.toLowerCase() === key);

      if (form.state.values.todoKind === "task") {
        const tag = findTagByKey(key);
        if (tag) {
          form.setFieldValue("tag", tag.autoFill.tag);
          return true;
        }
      }

      const typeKey = findKeyByHint(todoType);
      if (typeKey) {
        form.setFieldValue("todoKind", typeKey as FTodo["todoKind"]);
        event.preventDefault(); // eat event, otherwise it'll append char to the input
        return true;
      }

      const pushFrontKey = findKeyByHint(pushFrontVariants);
      if (pushFrontKey) {
        form.setFieldValue("pushFront", pushFrontKey === "true");
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

  // Sync form with the editedTodo
  useEffect(() => {
    form.reset();
  }, [editedTodo]);

  const hintStyles =
    "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

  return (
    <form
      ref={formRef}
      className={cn("flex flex-col gap-4", !enabled && "hidden")}
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
              data-focusable
              autoComplete="off"
              ref={nameInputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        />
        <Button variant="ghost" type="submit" size="icon">
          <ArrowRight className="size-4 h-full" />
        </Button>
      </div>

      <div className="flex gap-12">
        <form.Field
          name="todoKind"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <p className="text-pink-500">Type</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={field.state.value}
                onValueChange={(it) =>
                  field.handleChange(it as FTodo["todoKind"])
                }
              >
                {Object.entries(todoType).map(([value, [label, hint]]) => (
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
          name="pushFront"
          children={(field) => (
            <div
              className={cn("flex flex-col gap-1.5", !!editedId && "hidden")}
            >
              <p className="text-pink-500">Position</p>
              <ToggleGroup
                type="single"
                spacing={2}
                value={`${field.state.value}`}
                onValueChange={(it) => field.handleChange(it === "true")}
              >
                {Object.entries(pushFrontVariants).map(
                  ([value, [label, hint]]) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      aria-label={value}
                      className="relative"
                    >
                      <span>{label}</span>
                      <span className={hintStyles}>{hint}</span>
                    </ToggleGroupItem>
                  )
                )}
              </ToggleGroup>
            </div>
          )}
        />
      </div>

      <form.Field
        name="eventRawTime"
        children={(field) => (
          <div className={cn("flex flex-col gap-1.5", editingTask && "hidden")}>
            <p className="inline-flex min-w-10 items-center text-pink-500">
              Time
            </p>
            <Input
              autoComplete="off"
              ref={eventRawTimeRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              data-focusable={editingEvent}
            />
          </div>
        )}
      />

      <form.Field
        name="tag"
        children={(field) => (
          <div className={cn("flex flex-col gap-2", editingEvent && "hidden")}>
            <p className="text-pink-500">Tags</p>
            <ToggleGroup
              type="single"
              spacing={2}
              value={field.state.value}
              onValueChange={(it) => field.handleChange(it as FTodo["tag"])}
              className="grid grid-cols-3 gap-x-4 gap-y-8"
            >
              {tags.map(({ autoFill: { tag }, key, description, emoji }) => (
                <ToggleGroupItem
                  key={tag}
                  value={tag}
                  aria-label={tag}
                  className="relative flex size-full flex-col items-center justify-center rounded-lg border"
                >
                  <span className="py-2 text-4xl">{emoji}</span>
                  <span className="text-center text-lg whitespace-pre-line">
                    {description}
                  </span>
                  <span className="absolute top-1 right-1 font-mono text-xl font-bold text-pink-500">
                    {key}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      />
    </form>
  );
};
