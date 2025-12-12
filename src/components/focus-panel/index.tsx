import { Timeline } from "@/components/timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTasksStore,
  type Task,
  type TaskGroup,
} from "@/domain/stores/tasks-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { head } from "lodash";
import { useState, type FC } from "react";
import { EditDialog } from "./edit-dialog";
import { nextNotCompleted } from "./focus-panel-utils";
import { NextDialog } from "./next-dialog";
import { TimeDialog } from "./time-dialog";
import { SwitchDialog } from "./switch-dialog";

export const FocusPanel: FC<{
  onTabChange: () => void;
  className?: string;
}> = ({ onTabChange, className }) => {
  const groups = useTasksStore((s) => s.groups);
  const updateTask = useTasksStore((s) => s.updateTask);
  const focusedGroupId = useUiStore((s) => s.focusedGroupId);
  const setFocusedGroup = useUiStore((s) => s.setFocusedGroup);
  const uiNextGroupId = useUiStore((s) => s.nextGroupId);
  const setNextGroup = useUiStore((s) => s.setNextGroup);
  const [currentDialog, setCurrentDialog] = useState("");

  const currentGroup: TaskGroup | undefined =
    groups.find((g) => g.id === focusedGroupId) ?? head(groups);

  const focusedTask: Task | undefined =
    currentGroup?.tasks.find((t) => !t.completed) ?? undefined;

  const nextGroupId = uiNextGroupId || focusedGroupId;
  const nextGroup = groups.find((g) => g.id === nextGroupId) ?? currentGroup;
  const nextTask = nextNotCompleted(nextGroup, focusedTask);

  const done = () => {
    if (!currentGroup || !focusedTask?.id) return;

    updateTask(currentGroup.id, focusedTask?.id, { completed: true });

    // If switching to a different group, update focused group
    if (nextGroupId !== focusedGroupId) {
      setFocusedGroup(nextGroupId!);
    }
  };

  useShortcuts(
    {
      d: done,
      w: onTabChange,
      e: () => setCurrentDialog("Edit"),
      s: () => setCurrentDialog("Switch"),
      n: () => setCurrentDialog("Next"),
      t: () => setCurrentDialog("Time"),
      escape: () => setCurrentDialog(""),
    },
    {
      enabled: currentDialog == "",
    }
  );

  return (
    <div className={className}>
      <div className="mb-4 flex items-center gap-3">
        <Select
          value={focusedGroupId ?? undefined}
          onValueChange={(v: string) => setFocusedGroup(v)}
        >
          <SelectTrigger size="default">
            <SelectValue>{currentGroup?.name ?? "Select group"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 rounded-md border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-lg font-semibold">
          {focusedTask ? focusedTask.title : "No tasks so far"}
        </p>

        <Timeline />

        {/* Next task */}
        <div className="mt-6 flex justify-end">
          {nextTask ? (
            <div className="text-right">
              <div className="text-muted-foreground text-xs">
                Up next{" "}
                {nextGroupId !== focusedGroupId && nextGroup
                  ? `from ${nextGroup.name}`
                  : ""}
              </div>
              <p className="mt-1 text-xs">{nextTask.title}</p>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">Finito</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Select
          value={nextGroupId || focusedGroupId || undefined}
          onValueChange={(id: string) => {
            setNextGroup(id === focusedGroupId ? null : id);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {nextGroupId
                ? groups.find((g) => g.id === nextGroupId)?.name
                : currentGroup?.name || "Same group"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <EditDialog
        key={`Edit-${focusedTask?.id}`}
        open={currentDialog === "Edit"}
        onClose={() => setCurrentDialog("")}
      />

      <SwitchDialog
        key={`Switch-${focusedTask?.id}`}
        open={currentDialog === "Switch"}
        onClose={() => setCurrentDialog("")}
      />

      <NextDialog
        key={`Next-${focusedTask?.id}`}
        open={currentDialog === "Next"}
        onClose={() => setCurrentDialog("")}
        groupId={nextGroupId}
      />

      <TimeDialog
        key={`Time-${focusedTask?.id}`}
        open={currentDialog === "Time"}
        onClose={() => setCurrentDialog("")}
      />
    </div>
  );
};

export default FocusPanel;
