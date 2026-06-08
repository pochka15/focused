import type { BacklogTask } from "@/lib/stores/planning-store";
import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { Trash2 } from "lucide-react";
import { KIND_META } from "./backlog-task-card";

type Props = {
  tasks: BacklogTask[];
  onActivate: (id: number) => void;
  onDelete: (task: BacklogTask) => void;
  onDeleteDone?: () => void;
};

export function BacklogPostponed({
  tasks,
  onActivate,
  onDelete,
  onDeleteDone,
}: Props) {
  if (tasks.length === 0) return null;

  return (
    <Accordion mt="xl" variant="separated">
      <Accordion.Item value="postponed">
        <Accordion.Control>
          <Text size="sm" c="dimmed">
            Postponed ({tasks.length})
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            {tasks.map((task) => (
              <Card key={task.id} withBorder padding="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                    <Text size="sm" c="dimmed" truncate>
                      #{task.id} {task.name}
                    </Text>
                    <Badge
                      size="xs"
                      color={KIND_META[task.kind].color}
                      variant="light"
                      w="fit-content"
                    >
                      {KIND_META[task.kind].emoji} {KIND_META[task.kind].label}
                    </Badge>
                  </Stack>
                  <Group gap={4}>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() => onActivate(task.id)}
                    >
                      Activate
                    </Button>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
          {onDeleteDone && (
            <Button
              size="xs"
              color="red"
              variant="light"
              fullWidth
              mt="sm"
              onClick={onDeleteDone}
            >
              Delete All Done
            </Button>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
