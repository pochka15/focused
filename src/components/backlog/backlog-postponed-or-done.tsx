import type { BacklogTask } from "@/lib/stores/backlog-store";
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

type Props = {
  postponedTasks: BacklogTask[];
  doneTasks: BacklogTask[];
  onActivate: (id: number) => void;
  onDelete: (task: BacklogTask) => void;
  onDeleteDone?: () => void;
};

export function BacklogPostponedOrDone({
  postponedTasks,
  doneTasks,
  onActivate,
  onDelete,
  onDeleteDone,
}: Props) {
  if (postponedTasks.length === 0 && doneTasks.length === 0) return null;

  return (
    <Accordion mt="xl" variant="separated">
      {postponedTasks.length > 0 && (
        <Accordion.Item value="postponed">
          <Accordion.Control>
            <Text size="sm" c="dimmed">
              Postponed ({postponedTasks.length})
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {postponedTasks.map((task) => (
                <Card key={task.id} withBorder padding="xs">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                      <Text size="sm" c="dimmed" truncate>
                        #{task.id} {task.name}
                      </Text>
                      <Group gap={4} wrap="wrap">
                        {task.isNext && (
                          <Badge size="xs" color="red" variant="light">
                            next
                          </Badge>
                        )}
                        {task.tag.trim() && (
                          <Badge size="xs" color="gray" variant="light">
                            {task.tag}
                          </Badge>
                        )}
                      </Group>
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
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {doneTasks.length > 0 && (
        <Accordion.Item value="done">
          <Accordion.Control>
            <Text size="sm" c="dimmed">
              Done ({doneTasks.length})
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {doneTasks.map((task) => (
                <Card key={task.id} withBorder padding="xs">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                      <Text size="sm" c="dimmed" truncate>
                        #{task.id} {task.name}
                      </Text>
                      <Group gap={4} wrap="wrap">
                        <Badge size="xs" color="green" variant="light">
                          done
                        </Badge>
                        {task.tag.trim() && (
                          <Badge size="xs" color="gray" variant="light">
                            {task.tag}
                          </Badge>
                        )}
                      </Group>
                    </Stack>
                    <Group gap={4}>
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
      )}
    </Accordion>
  );
}
