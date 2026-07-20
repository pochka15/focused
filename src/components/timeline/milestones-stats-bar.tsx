import { useTimelineStore } from "@/lib/stores/timeline-store";
import { isMilestone } from "@/lib/timeline/timeline-models";
import { orderedTags, tagsMapping, type TagName } from "@/lib/todos/mappings";
import { Box, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import classes from "./milestones-stats-bar.module.css";

type TagCounts = {
  "good-one": number;
  "light-good": number;
  "deep-routine": number;
  "light-routine": number;
};

const approxMinutesByTag: Partial<Record<TagName, { min: number; max: number }>> = {
  "good-one": { min: 30, max: 60 },
  "light-good": { min: 15, max: 30 },
  "deep-routine": { min: 30, max: 60 },
  "light-routine": { min: 15, max: 30 },
};

function formatTimeRange(min: number, max: number): string {
  const minHours = Math.floor(min / 60);
  const minMins = min % 60;
  const maxHours = Math.floor(max / 60);
  const maxMins = max % 60;

  if (minHours > 0 && maxHours > 0) {
    return `${minHours}ч ${minMins}м – ${maxHours}ч ${maxMins}м`;
  }
  return `${min}м – ${max}м`;
}

// Wheel geometry
const RADIUS = 66;
const STACK_STEP = 15;
const MAX_STACK = 4;

type EmojiGroup = {
  tag: TagName;
  emoji: string;
  count: number;
};

function EmojiWheel({ groups, total }: { groups: EmojiGroup[]; total: number }) {
  const angleStep = groups.length > 0 ? 360 / groups.length : 0;

  return (
    <div className={classes.wheel}>
      <div className={classes.hub}>{total}</div>

      {groups.map((group, groupIndex) => {
        const angleDeg = -90 + angleStep * groupIndex;
        const angleRad = (angleDeg * Math.PI) / 180;
        const dx = Math.cos(angleRad);
        const dy = Math.sin(angleRad);

        const visibleCount = Math.min(group.count, MAX_STACK);
        const overflow = group.count - visibleCount;

        return (
          <div key={group.tag} className={classes.group}>
            {Array.from({ length: visibleCount }).map((_, stackIndex) => {
              // stackIndex 0 is the front emoji, sitting at the outer edge of the
              // circle; later ones line up behind it toward the hub, each a bit
              // smaller and dimmer so they read as peeking out from behind.
              const depth = visibleCount - 1 - stackIndex;
              const distance = RADIUS - depth * STACK_STEP;
              const x = dx * distance;
              const y = dy * distance;
              const scale = 1 - depth * 0.12;
              const isOverflowAnchor = stackIndex === visibleCount - 1 && overflow > 0;

              return (
                <div
                  key={stackIndex}
                  className={classes.emoji}
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                    zIndex: stackIndex + 1,
                  }}
                >
                  {group.emoji}
                  {isOverflowAnchor && <span className={classes.overflowBadge}>+{overflow}</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function MilestonesStatsBar() {
  const items = useTimelineStore((s) => s.items);

  const { timeRange, groups, total } = useMemo(() => {
    const counts: Record<TagName, number> = Object.fromEntries(
      orderedTags.map((tag) => [tag, 0])
    ) as Record<TagName, number>;

    for (const item of items) {
      if (!isMilestone(item) || !item.completed) continue;
      counts[item.tag] += 1;
    }

    const primaryCounts: TagCounts = {
      "good-one": counts["good-one"] || 0,
      "light-good": counts["light-good"] || 0,
      "deep-routine": counts["deep-routine"] || 0,
      "light-routine": counts["light-routine"] || 0,
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    // Calculate time range
    let totalMin = 0;
    let totalMax = 0;
    for (const [tag, count] of Object.entries(primaryCounts)) {
      const range = approxMinutesByTag[tag as TagName];
      if (range && count > 0) {
        totalMin += range.min * count;
        totalMax += range.max * count;
      }
    }

    const timeRange = totalMin > 0 ? formatTimeRange(totalMin, totalMax) : null;

    const groups: EmojiGroup[] = orderedTags
      .filter((tag) => counts[tag] > 0)
      .map((tag) => ({
        tag,
        emoji: tagsMapping[tag].emoji,
        count: counts[tag],
      }));

    return { timeRange, groups, total };
  }, [items]);

  return (
    <Box className={classes.container}>
      <Stack align="center" gap={10}>
        <EmojiWheel groups={groups} total={total} />

        <Stack gap={2} align="center">
          {timeRange && (
            <Text size="xs" c="dimmed" fw={400}>
              ⏱ {timeRange}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
