import { useSimpleForm } from "@/hooks/use-simple-form";
import type {
  NewTimelineEvent,
  TimelineEvent,
} from "@/lib/timeline/timeline-models";
import { isInputFocused } from "@/shared-lib/shortcuts/is-input-focused";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect } from "react";

type EventFormValues = {
  name: string;
  rawTime: string;
  durationMinutes: number;
};

const defaultValues = (item?: TimelineEvent): EventFormValues => ({
  name: item?.name ?? "",
  rawTime: item?.rawTime ?? "",
  durationMinutes: item?.durationMinutes ?? 30,
});

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (item: NewTimelineEvent) => void;
  editing?: TimelineEvent;
};

export function EventModal({ opened, onClose, onSubmit, editing }: Props) {
  const { values, field, setValues, reset } = useSimpleForm<EventFormValues>(
    defaultValues(editing)
  );

  useEffect(() => {
    if (opened) setValues(defaultValues(editing));
  }, [opened]);

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    onSubmit({
      type: "event",
      name: values.name.trim(),
      rawTime: values.rawTime,
      durationMinutes: values.durationMinutes,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "eventModal",
    enabled: opened,
    keys: (key, event) => {
      if (isInputFocused() && key !== "Enter") return true;
      if (key === "Enter") {
        event.preventDefault();
        handleSubmit();
        return true;
      }
      return true;
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? "Edit event" : "New event"}
      size="sm"
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="Team meeting, lunch, etc."
          autoFocus
          data-autofocus
          value={values.name}
          onChange={(e) => field("name").onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <TextInput
          label="Time (HH:MM)"
          placeholder="14:30"
          value={values.rawTime}
          onChange={(e) => field("rawTime").onChange(e.target.value)}
        />
        <NumberInput
          label="Duration (minutes)"
          min={5}
          step={5}
          value={values.durationMinutes}
          onChange={(v) => field("durationMinutes").onChange(Number(v))}
        />
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
