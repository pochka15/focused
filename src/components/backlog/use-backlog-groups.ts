import type { BacklogTask } from "@/lib/stores/planning-store";
import {
  BACKLOG_GROUPS,
  type GridGroup,
  useBacklogGridStore,
} from "@/lib/stores/backlog-grid-store";
import { useMemo } from "react";

export const GROUPS: GridGroup[] = [...BACKLOG_GROUPS];

export const GROUP_LABELS: Record<GridGroup, string> = Object.fromEntries(
  GROUPS.map((group) => [group, `Group ${group}`])
);

export function getGroupOf(
  taskId: number,
  groups: Record<GridGroup, number[]>
): GridGroup {
  for (const g of GROUPS) {
    if (groups[g]?.includes(taskId)) return g;
  }
  return 1;
}

export function useTasksByGroups(
  tasks: BacklogTask[],
  groupsList: GridGroup[]
): Record<GridGroup, BacklogTask[]> {
  const getOrderedIds = useBacklogGridStore((s) => s.getOrderedIds);
  const groups = useBacklogGridStore((s) => s.groups);

  return useMemo(() => {
    const base = tasks;
    const result = {} as Record<GridGroup, BacklogTask[]>;

    for (const group of groupsList) {
      const validIds = new Set(base.map((t) => t.id));
      const orderedIds = getOrderedIds(group, validIds);
      const orderedSet = new Set(orderedIds);
      const ordered = orderedIds
        .map((id) => base.find((t) => t.id === id)!)
        .filter(Boolean);
      const rest = base
        .filter(
          (t) => !orderedSet.has(t.id) && getGroupOf(t.id, groups) === group
        )
        .sort((a, b) => a.id - b.id);
      result[group] = [...ordered, ...rest];
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, groups, groupsList]);
}

export function useAllTasksSorted(tasks: BacklogTask[]): BacklogTask[] {
  const getOrderedIds = useBacklogGridStore((s) => s.getOrderedIds);
  const groups = useBacklogGridStore((s) => s.groups);

  return useMemo(() => {
    const base = tasks;
    const validIds = new Set(base.map((t) => t.id));
    const ordered = getOrderedIds(1, validIds);
    const orderedSet = new Set(ordered);
    const orderedTasks = ordered
      .map((id) => base.find((t) => t.id === id)!)
      .filter(Boolean);
    const rest = base
      .filter((t) => !orderedSet.has(t.id))
      .sort((a, b) => a.id - b.id);
    return [...orderedTasks, ...rest];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, groups]);
}
