import { useTimelineStore } from "@/lib/stores/timeline-store";
import { isMilestone } from "@/lib/timeline/timeline-models";
import { orderedTags, tagsMapping, type TagName } from "@/lib/todos/mappings";
import { tw } from "@/lib/utils";
import { Timer, type LucideIcon } from "lucide-react";
import { useMemo } from "react";

const iconChipStyles = tw`
  flex size-6 items-center justify-center rounded-full bg-card shadow-xs
  ring-1 ring-foreground/10
`;

type TagCounts = {
  "good-one": number;
  "light-good": number;
  "deep-routine": number;
  "light-routine": number;
};

const approxMinutesByTag: Partial<
  Record<TagName, { min: number; max: number }>
> = {
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

const MAX_STACK = 5;

type IconGroup = {
  tag: TagName;
  icon: LucideIcon;
  count: number;
};

const IconRow = ({ group }: { group: IconGroup }) => (
  <div className="flex items-center justify-end gap-2">
    <div className="flex *:not-first:-ml-2">
      {Array.from({ length: Math.min(group.count, MAX_STACK) }).map(
        (_, idx) => (
          <span key={idx} className={iconChipStyles}>
            <group.icon strokeWidth={1.5} className="size-3.5" />
          </span>
        )
      )}
    </div>
    <span className="w-4 text-right font-mono text-xs text-muted-foreground tabular-nums">
      {group.count}
    </span>
  </div>
);

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

    const groups: IconGroup[] = orderedTags
      .filter((tag) => counts[tag] > 0)
      .map((tag) => ({
        tag,
        icon: tagsMapping[tag].icon,
        count: counts[tag],
      }));

    return { timeRange, groups, total };
  }, [items]);

  if (total === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 z-10 flex flex-col items-end gap-1.5">
      {groups.map((group) => (
        <IconRow key={group.tag} group={group} />
      ))}
      <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
        {timeRange && (
          <span className="flex items-center gap-1">
            <Timer className="size-3" />
            {timeRange}
          </span>
        )}
        <span className="font-semibold text-foreground tabular-nums">
          Σ {total}
        </span>
      </div>
    </div>
  );
}
