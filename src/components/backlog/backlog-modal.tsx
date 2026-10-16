import { useDeferredFocus } from "@/hooks/use-deferred-focus";
import { useSimpleForm } from "@/hooks/use-simple-form";
import { BACKLOG_TAG_PRESETS } from "@/lib/backlog/backlog-tag-presets";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { BACKLOG_MODAL_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
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
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { cn, tw } from "@/lib/utils";
import { CircleDashed, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const optionStyles = tw`
  flex w-full items-center gap-3 bg-muted/40 px-3 py-2 text-left
  text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
`;

const selectedOptionStyles = tw`
  bg-foreground text-background hover:bg-foreground hover:text-background
`;

const OptionButton = ({
  selected,
  shortcut,
  icon: Icon,
  label,
  onClick,
}: {
  selected: boolean;
  shortcut: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(optionStyles, selected && selectedOptionStyles)}
  >
    <Kbd>{shortcut}</Kbd>
    <Icon strokeWidth={1.5} className="size-4 shrink-0" />
    <span className="truncate text-xs">{label}</span>
  </button>
);

// ─── Form ─────────────────────────────────────────────────────────────────────

type BacklogFormValues = {
  name: string;
  description: string;
  tag: string;
};

const defaultValues = (task?: BacklogTask): BacklogFormValues => ({
  name: task?.name ?? "",
  description: task?.description ?? "",
  tag: task?.tag ?? "",
});

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<BacklogTask, "id">) => void;
  editing?: BacklogTask;
  // Only name + description; new tasks land in the inbox.
  simple?: boolean;
};

// ─── Tag options ──────────────────────────────────────────────────────────────
// Keys line up 1:1 with BACKLOG_MODAL_SHORTCUTS.tagKeys.

const TAG_OPTIONS = [
  { value: "", icon: CircleDashed, label: "Входящие" },
  ...BACKLOG_TAG_PRESETS.map((preset) => ({
    value: preset.value,
    icon: preset.icon,
    label: preset.label,
  })),
].map((opt, index) => ({
  ...opt,
  key: BACKLOG_MODAL_SHORTCUTS.tagKeys[index]!,
}));

export function BacklogModal({
  opened,
  onClose,
  onSubmit,
  editing,
  simple: simpleProp = false,
}: Props) {
  // Latched on open so the closing animation doesn't flip the layout.
  const [simple, setSimple] = useState(simpleProp);
  const nameRef = useRef<HTMLInputElement>(null);
  useDeferredFocus(nameRef, opened);
  const { values, setValues, reset } = useSimpleForm<BacklogFormValues>(
    defaultValues(editing)
  );

  useEffect(() => {
    if (opened) {
      setValues(defaultValues(editing));
      setSimple(simpleProp);
    }
  }, [opened, editing, setValues, simpleProp]);

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    onSubmit({
      name: values.name.trim(),
      description: values.description,
      tag: values.tag,
      snoozeUntil: editing?.snoozeUntil ?? null,
      isDone: editing?.isDone ?? false,
      isPostponed: editing?.isPostponed ?? false,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "backlogModal",
    enabled: opened,
    keys: (key, event) => {
      if (key === BACKLOG_MODAL_SHORTCUTS.submit) {
        event.preventDefault();
        handleSubmit();
        return true;
      }
      const el = document.activeElement as HTMLElement | null;
      const inputFocused =
        el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
      const isCtrlN = key === BACKLOG_MODAL_SHORTCUTS.toggleFocus;

      if (isCtrlN) {
        event.preventDefault();
        if (inputFocused) el.blur();
        else nameRef.current?.focus();
        return true;
      }

      if (inputFocused || simple) return true;

      const tagOpt = TAG_OPTIONS.find((opt) => opt.key === key);
      if (tagOpt) {
        event.preventDefault();
        setValues((current) => ({ ...current, tag: tagOpt.value }));
        return true;
      }

      return true;
    },
  });

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm" initialFocus={false}>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit task" : simple ? "New inbox task" : "New task"}
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="backlog-name">Name</FieldLabel>
            <Input
              id="backlog-name"
              ref={nameRef}
              placeholder="Task name"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="backlog-description">Description</FieldLabel>
            <Textarea
              id="backlog-description"
              placeholder="Optional context"
              className="max-h-48 min-h-12"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
            />
          </Field>

          {!simple && (
            <FieldSet>
              <FieldLegend variant="label">Tag</FieldLegend>
              <div className="flex flex-col gap-1">
                {TAG_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={values.tag === opt.value}
                    shortcut={opt.key}
                    icon={opt.icon}
                    label={opt.label}
                    onClick={() =>
                      setValues((current) => ({ ...current, tag: opt.value }))
                    }
                  />
                ))}
              </div>
            </FieldSet>
          )}
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
