import type { Notification } from "@/lib/notifications/notifications-models";
import { parseRepeatDuration } from "@/lib/notifications/repeat-duration-utils";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRef } from "react";

const DEFAULT_TIME_H = 11;
const DEFAULT_TIME_M = 0;

function newNotification(): Notification {
  return {
    id: crypto.randomUUID(),
    notificationName: "",
    timeH: 9,
    timeM: 0,
    repeatsInMinutes: 0,
    isComplete: false,
  };
}

function formatRepeats(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function NotificationsView() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const editNotification = useNotificationsStore((s) => s.editNotification);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const moveNotification = useNotificationsStore((s) => s.moveNotification);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);

  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (updated: Notification) => {
    editNotification(updated);
  };

  const handleAddRow = () => {
    addNotification(newNotification());
    setTimeout(() => lastNameRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        timeH: DEFAULT_TIME_H,
        timeM: DEFAULT_TIME_M,
        isComplete: false,
      }))
    );
  };

  useShortcuts({
    name: "notificationsView",
    enabled: true,
    keys: () => {
      const el = document.activeElement as HTMLElement | null;
      return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
    },
  });

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={3}>Notifications</Title>
        <Group gap="xs">
          <Button
            size="xs"
            variant="subtle"
            leftSection={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            Reset times
          </Button>
          <Button
            size="xs"
            variant="light"
            leftSection={<Plus size={14} />}
            onClick={handleAddRow}
          >
            Add
          </Button>
        </Group>
      </Group>

      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={70}>Move</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th w={120}>HH : MM</Table.Th>
            <Table.Th w={120}>Repeats</Table.Th>
            <Table.Th w={60}>Done</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th w={40} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {notifications.map((n, idx) => {
            const isLast = idx === notifications.length - 1;
            return (
              <Table.Tr key={n.id}>
                <Table.Td>
                  <Group gap={2}>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      disabled={idx === 0}
                      onClick={() => moveNotification(n.id, -1)}
                    >
                      <ChevronUp size={12} />
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      disabled={isLast}
                      onClick={() => moveNotification(n.id, 1)}
                    >
                      <ChevronDown size={12} />
                    </ActionIcon>
                  </Group>
                </Table.Td>

                <Table.Td>
                  <TextInput
                    ref={isLast ? lastNameRef : undefined}
                    size="xs"
                    autoComplete="off"
                    value={n.notificationName}
                    onChange={(e) =>
                      handleFieldChange({
                        ...n,
                        notificationName: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Tab" && !e.shiftKey && isLast) {
                        e.preventDefault();
                        handleAddRow();
                      }
                    }}
                  />
                </Table.Td>

                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <TextInput
                      size="xs"
                      w={44}
                      type="number"
                      min={0}
                      max={23}
                      autoComplete="off"
                      value={n.timeH}
                      onChange={(e) =>
                        handleFieldChange({
                          ...n,
                          timeH: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <Text size="sm">:</Text>
                    <TextInput
                      size="xs"
                      w={44}
                      type="number"
                      min={0}
                      max={59}
                      autoComplete="off"
                      value={n.timeM}
                      onChange={(e) =>
                        handleFieldChange({
                          ...n,
                          timeM: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </Group>
                </Table.Td>

                <Table.Td>
                  <TextInput
                    size="xs"
                    autoComplete="off"
                    placeholder="1h 20m"
                    value={formatRepeats(n.repeatsInMinutes)}
                    onChange={(e) =>
                      handleFieldChange({
                        ...n,
                        repeatsInMinutes:
                          parseRepeatDuration(e.target.value) ?? 0,
                      })
                    }
                  />
                </Table.Td>

                <Table.Td>
                  <Checkbox
                    size="xs"
                    checked={n.isComplete}
                    onChange={(e) =>
                      editNotification({ ...n, isComplete: e.target.checked })
                    }
                  />
                </Table.Td>

                <Table.Td>
                  <TextInput
                    size="xs"
                    autoComplete="off"
                    value={n.notificationDescription ?? ""}
                    onChange={(e) =>
                      handleFieldChange({
                        ...n,
                        notificationDescription: e.target.value || undefined,
                      })
                    }
                  />
                </Table.Td>

                <Table.Td>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="red"
                    disabled={notifications.length === 1}
                    onClick={() => removeNotification(n.id)}
                  >
                    <Trash2 size={12} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
