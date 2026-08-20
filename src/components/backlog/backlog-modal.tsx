import { useSimpleForm } from "@/hooks/use-simple-form";
import { BACKLOG_TAG_PRESETS } from "@/lib/backlog/backlog-tag-presets";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { BACKLOG_MODAL_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import {
  Box,
  Button,
  Group,
  Kbd,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useEffect, useRef } from "react";
import classes from "./backlog-modal.module.css";

// ─── Form ─────────────────────────────────────────────────────────────────────

type BacklogFormValues = {
  name: string;
  description: string;
  isNext: boolean;
  tag: string;
};

const defaultValues = (task?: BacklogTask): BacklogFormValues => ({
  name: task?.name ?? "",
  description: task?.description ?? "",
  isNext: task?.isNext ?? false,
  tag: task?.tag ?? "",
});

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<BacklogTask, "id">) => void;
  editing?: BacklogTask;
};

// ─── Tag options ──────────────────────────────────────────────────────────────
// Keys line up 1:1 with BACKLOG_MODAL_SHORTCUTS.tagKeys.

const TAG_OPTIONS = [
  { value: "", emoji: "∅", label: "Без тега" },
  ...BACKLOG_TAG_PRESETS.map((preset) => ({
    value: preset.value,
    emoji: preset.emoji,
    label: preset.label,
  })),
].map((opt, index) => ({
  ...opt,
  key: BACKLOG_MODAL_SHORTCUTS.tagKeys[index]!,
}));

const NEXT_FALSE = { emoji: "🫙", label: "Пока не на очереди" };
const NEXT_TRUE = { emoji: "🔥", label: "На очереди" };

export function BacklogModal({ opened, onClose, onSubmit, editing }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const { values, setValues, reset } = useSimpleForm<BacklogFormValues>(
    defaultValues(editing)
  );

  useEffect(() => {
    if (opened) {
      setValues(defaultValues(editing));
    }
  }, [opened, editing, setValues]);

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    onSubmit({
      name: values.name.trim(),
      description: values.description,
      isNext: values.isNext,
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

      if (inputFocused) return true;

      const tagOpt = TAG_OPTIONS.find((opt) => opt.key === key);
      if (tagOpt) {
        event.preventDefault();
        setValues((current) => ({ ...current, tag: tagOpt.value }));
        return true;
      }

      if (key === BACKLOG_MODAL_SHORTCUTS.toggleNext) {
        event.preventDefault();
        setValues((current) => ({ ...current, isNext: !current.isNext }));
        return true;
      }

      return true;
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? "Edit task" : "New task"}
      size="sm"
    >
      <Stack gap="sm">
        <TextInput
          ref={nameRef}
          data-autofocus="true"
          label="Name"
          placeholder="Task name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Textarea
          label="Description"
          placeholder="Optional context"
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          autosize
          minRows={2}
          maxRows={8}
        />

        <Box>
          <Text size="xs" c="dimmed" mb={6}>
            Tag
          </Text>
          <Stack gap={4}>
            {TAG_OPTIONS.map((opt) => {
              const isSelected = values.tag === opt.value;
              return (
                <UnstyledButton
                  key={opt.value}
                  onClick={() =>
                    setValues((current) => ({ ...current, tag: opt.value }))
                  }
                  className={isSelected ? classes.tagSelected : classes.tag}
                >
                  <Group gap={8} wrap="nowrap">
                    <Kbd size="xs">{opt.key}</Kbd>
                    <Text size="lg" lh={1}>
                      {opt.emoji}
                    </Text>
                    <Text size="xs" truncate>
                      {opt.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>

        <Box>
          <Text size="xs" c="dimmed" mb={6}>
            Next
          </Text>
          <UnstyledButton
            onClick={() =>
              setValues((current) => ({ ...current, isNext: !current.isNext }))
            }
            className={values.isNext ? classes.tagSelected : classes.tag}
          >
            <Group gap={8} wrap="nowrap">
              <Kbd size="xs">{BACKLOG_MODAL_SHORTCUTS.toggleNext}</Kbd>
              <Text size="lg" lh={1}>
                {values.isNext ? NEXT_TRUE.emoji : NEXT_FALSE.emoji}
              </Text>
              <Text size="xs">
                {values.isNext ? NEXT_TRUE.label : NEXT_FALSE.label}
              </Text>
            </Group>
          </UnstyledButton>
        </Box>

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editing ? "Save" : "Add"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
