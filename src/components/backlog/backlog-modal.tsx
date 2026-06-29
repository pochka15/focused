import { useSimpleForm } from "@/hooks/use-simple-form";
import { BACKLOG_TAG_PRESETS } from "@/lib/backlog/backlog-tag-presets";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { BACKLOG_MODAL_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import {
  Button,
  Group,
  Kbd,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import classes from "./backlog-modal.module.css";
import { BinaryStep, CarouselStep } from "./step-picker";

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

// ─── Step definitions ─────────────────────────────────────────────────────────

const TAG_OPTIONS = [
  { value: "", emoji: "∅", label: "Без тега" },
  ...BACKLOG_TAG_PRESETS.map((preset) => ({
    value: preset.value,
    emoji: preset.emoji,
    label: preset.label,
  })),
];

const NEXT_FALSE = { emoji: "🫙", label: "Пока не на очереди" };
const NEXT_TRUE = { emoji: "🔥", label: "На очереди" };

const STEP_COUNT = 2;

export function BacklogModal({ opened, onClose, onSubmit, editing }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const { values, setValues, reset } = useSimpleForm<BacklogFormValues>(
    defaultValues(editing)
  );
  const [step, setStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);

  useEffect(() => {
    if (opened) {
      setValues(defaultValues(editing));
      setStep(0);
      setStepKey((current) => current + 1);
    }
  }, [opened, editing, setValues]);

  const goStep = (direction: -1 | 1) => {
    setStep((current) =>
      Math.max(0, Math.min(STEP_COUNT - 1, current + direction))
    );
    setStepKey((current) => current + 1);
  };

  const cycleCurrentStep = (direction: 1 | -1 = 1) => {
    if (step === 0) {
      setValues((current) => {
        const idx = TAG_OPTIONS.findIndex((opt) => opt.value === current.tag);
        const safeIdx = idx >= 0 ? idx : 0;
        const next =
          TAG_OPTIONS[
            (safeIdx + direction + TAG_OPTIONS.length) % TAG_OPTIONS.length
          ];
        return { ...current, tag: next?.value ?? "" };
      });
      return;
    }
    if (step === 1) {
      setValues((current) => ({ ...current, isNext: !current.isNext }));
      return;
    }
  };

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

      if (key === BACKLOG_MODAL_SHORTCUTS.stepBack) {
        event.preventDefault();
        goStep(-1);
        return true;
      }

      if (key === BACKLOG_MODAL_SHORTCUTS.stepForward) {
        event.preventDefault();
        if (step === STEP_COUNT - 1) {
          handleSubmit();
          return true;
        }
        goStep(1);
        return true;
      }

      if (key === BACKLOG_MODAL_SHORTCUTS.cycleDown) {
        event.preventDefault();
        cycleCurrentStep(1);
        return true;
      }

      if (key === BACKLOG_MODAL_SHORTCUTS.cycleUp) {
        event.preventDefault();
        cycleCurrentStep(-1);
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
        <div key={stepKey} className={classes.stepIn}>
          {step === 0 && (
            <CarouselStep
              options={TAG_OPTIONS}
              value={values.tag}
              onChange={(tag) => setValues((current) => ({ ...current, tag }))}
            />
          )}
          {step === 1 && (
            <BinaryStep
              value={values.isNext}
              falseOpt={NEXT_FALSE}
              trueOpt={NEXT_TRUE}
              onChange={(isNext) =>
                setValues((current) => ({ ...current, isNext }))
              }
            />
          )}
        </div>

        <div className={classes.stepNav}>
          <Text size="xs" c="dimmed">
            <Kbd size="xs">j</Kbd>/<Kbd size="xs">k</Kbd> step
          </Text>
          <div className={classes.dots}>
            {Array.from({ length: STEP_COUNT }).map((_, index) => (
              <div
                key={index}
                className={index === step ? classes.dotActive : classes.dot}
                onClick={() => {
                  setStep(index);
                  setStepKey((current) => current + 1);
                }}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          <Text size="xs" c="dimmed">
            <Kbd size="xs">h</Kbd>/<Kbd size="xs">l</Kbd> cycle
          </Text>
        </div>

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
