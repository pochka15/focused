import { useTimelineStore } from "@/lib/stores/timeline-store";
import { isMilestone } from "@/lib/timeline/timeline-models";
import { orderedTags, tagsMapping, type TagName } from "@/lib/todos/mappings";
import {
  Divider,
  Group,
  HoverCard,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { ChartColumn } from "lucide-react";
import { useMemo } from "react";
import classes from "./__root.module.css";

type ApproxMinutesRange = {
  min: number;
  max: number;
};

const approxMinutesByTag: Partial<Record<TagName, ApproxMinutesRange>> = {
  "good-one": { min: 30, max: 60 },
  "light-good": { min: 15, max: 30 },
  "deep-routine": { min: 30, max: 60 },
  "light-routine": { min: 15, max: 30 },
};

export function StatsHover() {
  const items = useTimelineStore((s) => s.items);

  const completedByTag = useMemo(() => {
    const counts: Record<TagName, number> = Object.fromEntries(
      orderedTags.map((tag) => [tag, 0])
    ) as Record<TagName, number>;

    for (const item of items) {
      if (!isMilestone(item) || !item.completed) continue;
      counts[item.tag] += 1;
    }

    return orderedTags.map((tag) => ({
      tag,
      emoji: tagsMapping[tag].emoji,
      count: counts[tag],
      approxRange: approxMinutesByTag[tag] ?? null,
    }));
  }, [items]);

  const completedTotal = completedByTag.reduce(
    (sum, row) => sum + row.count,
    0
  );

  const nonZeroCompletedByTag = completedByTag
    .filter((row) => row.count > 0)
    .map((row) => {
      if (!row.approxRange) {
        return {
          ...row,
          approxTotalRange: null,
        };
      }

      return {
        ...row,
        approxTotalRange: {
          min: row.approxRange.min * row.count,
          max: row.approxRange.max * row.count,
        },
      };
    });

  const estimatedKnownTotalRange = nonZeroCompletedByTag.reduce(
    (sum, row) => {
      if (!row.approxTotalRange) return sum;
      return {
        min: sum.min + row.approxTotalRange.min,
        max: sum.max + row.approxTotalRange.max,
      };
    },
    { min: 0, max: 0 }
  );

  const minMinutes = Math.max(0, Math.min(360, estimatedKnownTotalRange.min));

  const maxMinutes = Math.max(
    minMinutes,
    Math.min(360, estimatedKnownTotalRange.max)
  );

  const rangeColor =
    maxMinutes < 120 ? "red.6" : maxMinutes < 210 ? "orange.6" : "green.6";

  return (
    <HoverCard
      width={300}
      position="right-start"
      withArrow
      openDelay={80}
      closeDelay={120}
      shadow="md"
    >
      <HoverCard.Target>
        <UnstyledButton className={classes.navItem}>
          <ChartColumn size={18} />
        </UnstyledButton>
      </HoverCard.Target>
      <HoverCard.Dropdown className={classes.shortcutsDropdown}>
        <Stack gap={6}>
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" fw={700} c="dimmed">
              Completed
            </Text>
            <Text size="xs" fw={700}>
              {completedTotal}
            </Text>
          </Group>

          <Divider my={2} />

          {nonZeroCompletedByTag.map((row) => (
            <Group key={row.tag} justify="space-between" wrap="nowrap">
              <Text size="xs">
                {row.emoji} {row.tag}
              </Text>
              <Text size="xs" fw={600}>
                {row.count}
              </Text>
            </Group>
          ))}

          <Divider size="sm" mt={2} color={rangeColor} />
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
