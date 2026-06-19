import type { BacklogTask } from "@/lib/stores/planning-store";
import {
  isTaskSnoozeExpired,
  isTaskSnoozed,
} from "@/lib/backlog/backlog-task-utils";
import { normalizeBacklogTag } from "@/lib/backlog/backlog-tag-presets";

export type SmartGroupId =
  | "check"
  | "queue"
  | "valuable"
  | "thank"
  | "duty"
  | "dessert"
  | "maybe"
  | "other"
  | "snoozed";

export type SmartGroup = {
  id: SmartGroupId;
  title: string;
  emoji: string;
  summary: string;
  tasks: BacklogTask[];
};

export const pluralizeRu = (
  n: number,
  one: string,
  few: string,
  many: string
): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const buildSummary = (id: SmartGroupId, n: number): string => {
  if (id === "check") {
    return `Чекнуть ${n} ${pluralizeRu(n, "задачу", "задачи", "задач")}`;
  }
  if (id === "queue") {
    return `${n} ${pluralizeRu(n, "задача", "задачи", "задач")} на очереди`;
  }
  if (id === "valuable") {
    return `Есть ${n} ${pluralizeRu(
      n,
      "прям valuable задача",
      "прям valuable задачи",
      "прям valuable задач"
    )}`;
  }
  if (id === "thank") {
    return `${n} ${pluralizeRu(n, "задача", "задачи", "задач")} — скажешь спасибо позже`;
  }
  if (id === "duty") {
    return `${n} ${pluralizeRu(
      n,
      "классическая дежурная задача",
      "классические дежурные задачи",
      "классических дежурных задач"
    )}`;
  }
  if (id === "dessert") {
    return `${n} ${pluralizeRu(
      n,
      "задача",
      "задачи",
      "задач"
    )} на десерт — сначала основное`;
  }
  if (id === "maybe") {
    return `${n} ${pluralizeRu(n, "задача", "задачи", "задач")} — вроде и прек, но хз`;
  }
  if (id === "snoozed") {
    return `${n} ${pluralizeRu(n, "задача", "задачи", "задач")} в snooze до времени`;
  }
  return `Шота какой-то рандом из ${n} ${pluralizeRu(n, "задачи", "задач", "задач")}`;
};

const createGroup = (
  id: SmartGroupId,
  title: string,
  emoji: string,
  tasks: BacklogTask[]
): SmartGroup => ({
  id,
  title,
  emoji,
  summary: buildSummary(id, tasks.length),
  tasks,
});

export const computeSmartGroups = (
  tasks: BacklogTask[],
  now: number = Date.now()
): SmartGroup[] => {
  const buckets: Record<SmartGroupId, BacklogTask[]> = {
    check: [],
    queue: [],
    valuable: [],
    thank: [],
    duty: [],
    dessert: [],
    maybe: [],
    other: [],
    snoozed: [],
  };

  for (const task of tasks) {
    const tag = normalizeBacklogTag(task.tag);

    if (isTaskSnoozeExpired(task, now)) {
      buckets.check.push(task);
      continue;
    }
    if (isTaskSnoozed(task, now)) {
      buckets.snoozed.push(task);
      continue;
    }
    if (task.isNext) {
      buckets.queue.push(task);
      continue;
    }
    if (tag === "real value") {
      buckets.valuable.push(task);
      continue;
    }
    if (tag === "thank me later") {
      buckets.thank.push(task);
      continue;
    }
    if (tag === "duty task") {
      buckets.duty.push(task);
      continue;
    }
    if (tag === "dessert") {
      buckets.dessert.push(task);
      continue;
    }
    if (tag === "maybe vibes") {
      buckets.maybe.push(task);
      continue;
    }
    buckets.other.push(task);
  }

  return [
    createGroup("check", "Чекнуть", "🔔", buckets.check),
    createGroup("queue", "На очереди", "⚡", buckets.queue),
    createGroup("valuable", "Реально важно", "🌟", buckets.valuable),
    createGroup("thank", "Потом скажешь себе спасибо", "🙏", buckets.thank),
    createGroup("duty", "Обычные дежурные задачи", "⚙️", buckets.duty),
    createGroup(
      "dessert",
      "Чисто порнуха, закрываем после основных задач",
      "🍰",
      buckets.dessert
    ),
    createGroup("maybe", "Вроде и прек, но хз", "🌀", buckets.maybe),
    createGroup("other", "Остальное", "📦", buckets.other),
    createGroup(
      "snoozed",
      "Можно чуток позже вернуться к этим вопросам",
      "⏳",
      buckets.snoozed
    ),
  ].filter((group) => group.tasks.length > 0);
};
