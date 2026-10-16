import { useDeferredFocus } from "@/hooks/use-deferred-focus";
import { useSimpleForm } from "@/hooks/use-simple-form";
import type { Milestone, NewMilestone } from "@/lib/timeline/timeline-models";
import {
  DEFAULT_TAG,
  isTagName,
  orderedTags,
  tagsMapping,
  type TagName,
} from "@/lib/todos/mappings";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { MILESTONE_MODAL_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { cn, tw } from "@/lib/utils";
import { useEffect, useRef } from "react";

const tagOptionStyles = tw`
  flex min-w-0 items-center gap-2.5 bg-muted/40 px-3 py-2.5 text-left
  text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
`;

type MilestoneFormValues = {
  name: string;
  tag: TagName;
  taskIdsRaw: string;
};

const parseTaskIds = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);

const defaultValues = (item?: Milestone): MilestoneFormValues => ({
  name: item?.name ?? "",
  tag: item && isTagName(item.tag) ? item.tag : DEFAULT_TAG,
  taskIdsRaw: item?.taskIds?.join(", ") ?? "",
});

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (item: NewMilestone) => void;
  editing?: Milestone;
};

export function MilestoneModal({ opened, onClose, onSubmit, editing }: Props) {
  const { values, field, setValues, reset } =
    useSimpleForm<MilestoneFormValues>(defaultValues(editing));
  const nameRef = useRef<HTMLInputElement>(null);
  useDeferredFocus(nameRef, opened);
  const allTasks = useBacklogStore((s) => s.tasks);

  useEffect(() => {
    if (opened) setValues(defaultValues(editing));
  }, [opened]);

  const boundTaskIds = parseTaskIds(values.taskIdsRaw);
  const boundTasks = boundTaskIds
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as typeof allTasks;

  const applyTag = (tagName: TagName) => {
    setValues((prev) => ({ ...prev, tag: tagName }));
  };

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    const taskIds = parseTaskIds(values.taskIdsRaw);
    onSubmit({
      type: "task",
      name: values.name.trim(),
      tag: values.tag,
      taskIds: taskIds.length > 0 ? taskIds : undefined,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "milestoneModal",
    enabled: opened,
    keys: (key, event) => {
      if (key === MILESTONE_MODAL_SHORTCUTS.submit) {
        event.preventDefault();
        handleSubmit();
        return true;
      }

      const el = document.activeElement as HTMLElement | null;
      const inputFocused =
        el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
      const isCtrlN = key === MILESTONE_MODAL_SHORTCUTS.toggleFocus;

      if (isCtrlN) {
        event.preventDefault();
        if (inputFocused) el.blur();
        else nameRef.current?.focus();
        return true;
      }

      if (inputFocused) return true;

      const match = orderedTags.find((t) => tagsMapping[t].key === key);
      if (match) {
        applyTag(match);
        return true;
      }
      return true;
    },
  });

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" initialFocus={false}>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit milestone" : "New milestone"}
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="milestone-name">Name</FieldLabel>
            <Input
              id="milestone-name"
              ref={nameRef}
              placeholder="What are you working on?"
              value={values.name}
              onChange={(e) => field("name").onChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="milestone-tasks">
              Linked backlog tasks
            </FieldLabel>
            <Input
              id="milestone-tasks"
              className="font-mono"
              placeholder="1, 4, 7"
              value={values.taskIdsRaw}
              onChange={(e) => field("taskIdsRaw").onChange(e.target.value)}
            />
            <FieldDescription>Comma-separated task IDs</FieldDescription>
            {boundTasks.length > 0 && (
              <div className="flex flex-col gap-1">
                {boundTasks.map((task) => (
                  <p key={task.id} className="flex gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">
                      #{task.id}
                    </span>
                    <span className="truncate">{task.name}</span>
                  </p>
                ))}
              </div>
            )}
          </Field>

          <FieldSet>
            <FieldLegend variant="label">Tag</FieldLegend>
            <div className="grid grid-cols-3 gap-1.5">
              {orderedTags.map((tagName) => {
                const tag = tagsMapping[tagName];
                const Icon = tag.icon;
                const isSelected = values.tag === tagName;
                return (
                  <button
                    type="button"
                    key={tagName}
                    onClick={() => applyTag(tagName)}
                    className={cn(
                      tagOptionStyles,
                      isSelected &&
                        "bg-foreground text-background hover:bg-foreground hover:text-background"
                    )}
                  >
                    <Icon strokeWidth={1.5} className="size-4 shrink-0" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-medium">
                        {tagName}
                      </span>
                      <span className="truncate text-[0.625rem] opacity-70">
                        {tag.description}
                      </span>
                    </span>
                    <Kbd className="ml-auto">{tag.key}</Kbd>
                  </button>
                );
              })}
            </div>
          </FieldSet>
        </FieldGroup>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editing ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
