import type { TimelineEvent } from "@/lib/timeline/timeline-models";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { Pencil, Trash2 } from "lucide-react";
import { formatDuration, isEventBehind } from "./timeline-utils";
import classes from "./timeline-view.module.css";

type Props = {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (event: TimelineEvent) => void;
};

export const TimelineEventRow = ({ event, onEdit, onDelete }: Props) => {
  return (
    <Box
      className={`${classes.eventCard} ${isEventBehind(event) ? classes.overdueEvent : ""}`}
      p="sm"
    >
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Text size="sm" fw={500}>
            {event.name}
          </Text>
          <Text size="xs" c="dimmed">
            {event.rawTime} · {formatDuration(event.durationMinutes)}
          </Text>
        </Box>
        <Group gap={4}>
          <ActionIcon size="xs" variant="subtle" onClick={() => onEdit(event)}>
            <Pencil size={12} />
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant="subtle"
            color="red"
            onClick={() => onDelete(event)}
          >
            <Trash2 size={12} />
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
};
