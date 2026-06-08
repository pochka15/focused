import { useSimpleForm } from "@/hooks/use-simple-form";
import type { Milestone, NewMilestone } from "@/lib/timeline/timeline-models";
import { orderedTags, tagsMapping, type TagName } from "@/lib/todos/mappings";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useEffect, useRef } from "react";
import classes from "./milestone-modal.module.css";

type MilestoneFormValues = {
  name: string;
  priority: number;
  tag: TagName;
  mode: string;
  taskIdsRaw: string;
};

const parseTaskIds = (raw: string): number[] =>
  raw
    .split(/[\s,]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);

const defaultValues = (item?: Milestone): MilestoneFormValues => ({
  name: item?.name ?? "",
  priority: item?.priority ?? 2,
  tag: item?.tag ?? "other",
  mode: item?.mode ?? "deep",
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
  const backlogTasksRef = useRef<HTMLInputElement>(null);
  const allTasks = usePlanningStore((s) => s.tasks);

  useEffect(() => {
    if (opened) setValues(defaultValues(editing));
  }, [opened]);

  const boundTaskIds = parseTaskIds(values.taskIdsRaw);
  const boundTasks = boundTaskIds
    .map((id) => allTasks.find((t) => t.id === id))
    .filter(Boolean) as typeof allTasks;

  const applyTag = (tagName: TagName) => {
    const { autoFill } = tagsMapping[tagName];
    setValues((prev) => ({
      ...prev,
      tag: tagName,
      priority: autoFill.priority,
      mode: autoFill.mode,
    }));
  };

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    const taskIds = parseTaskIds(values.taskIdsRaw);
    onSubmit({
      type: "task",
      name: values.name.trim(),
      priority: values.priority,
      tag: values.tag,
      mode: values.mode as NewMilestone["mode"],
      taskIds: taskIds.length > 0 ? taskIds : undefined,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "milestoneModal",
    enabled: opened,
    keys: (key, event) => {
      if (key === "Enter") {
        event.preventDefault();
        handleSubmit();
        return true;
      }

      if (key === "ctrl+n" || key === "ctrl+p") {
        event.preventDefault();
        backlogTasksRef.current?.focus();
        return true;
      }

      const el = document.activeElement as HTMLElement | null;
      const inputFocused =
        el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
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
    <Modal
      opened={opened}
      onClose={onClose}
      title={editing ? "Edit milestone" : "New milestone"}
      size="md"
    >
      <Stack gap="sm">
        <TextInput
          ref={backlogTasksRef}
          label="Linked backlog tasks"
          placeholder="1, 4, 7"
          description="Comma-separated task IDs"
          value={values.taskIdsRaw}
          onChange={(e) => field("taskIdsRaw").onChange(e.target.value)}
        />

        <TextInput
          label="Name"
          placeholder="What are you working on?"
          value={values.name}
          onChange={(e) => field("name").onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {boundTasks.length > 0 && (
          <Stack gap={4}>
            {boundTasks.map((task) => (
              <Group key={task.id} gap={6} wrap="nowrap">
                <Badge size="xs" variant="outline" color="gray">
                  #{task.id}
                </Badge>
                <Text size="xs" truncate>
                  {task.name}
                </Text>
              </Group>
            ))}
          </Stack>
        )}

        <Box>
          <Text size="xs" c="dimmed" mb={6}>
            Tag
          </Text>
          <SimpleGrid cols={3} spacing={6}>
            {orderedTags.map((tagName) => {
              const tag = tagsMapping[tagName];
              const isSelected = values.tag === tagName;
              return (
                <UnstyledButton
                  key={tagName}
                  onClick={() => applyTag(tagName)}
                  className={isSelected ? classes.tagSelected : classes.tag}
                >
                  <Group gap={6} wrap="nowrap">
                    <Text size="lg" lh={1}>
                      {tag.emoji}
                    </Text>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="xs" fw={500} truncate>
                        {tagName}
                      </Text>
                      <Badge size="xs" variant="outline" mt={2}>
                        {tag.key}
                      </Badge>
                    </Box>
                  </Group>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Box>

        <Text size="xs" c="dimmed">
          mode: <strong>{values.mode}</strong> · priority:{" "}
          <strong>{values.priority}</strong>
        </Text>

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
