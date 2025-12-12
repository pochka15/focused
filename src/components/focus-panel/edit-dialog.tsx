import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useTasksStore,
  type Task,
  type TaskGroup,
} from "@/lib/stores/tasks-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { useState, type FC } from "react";

export const EditDialog: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const groups = useTasksStore((s) => s.groups);
  const focusedGroupId = useUiStore((s) => s.focusedGroupId);
  const updateTask = useTasksStore((s) => s.updateTask);

  const currentGroup: TaskGroup | undefined = groups.find(
    (g) => g.id === focusedGroupId
  );

  const focusedTask: Task | undefined =
    currentGroup?.tasks.find((t) => !t.completed) ?? undefined;

  const [title, setTitle] = useState(focusedTask?.title || "");

  const submit = () => {
    if (focusedGroupId && focusedTask?.id) {
      updateTask(focusedGroupId, focusedTask.id, { title: title.trim() });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </DialogContent>
    </Dialog>
  );
};
