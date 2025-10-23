import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTasksStore } from "@/domain/stores/tasks-store";
import { useUiStore } from "@/domain/stores/ui-store";
import { useState, type FC } from "react";

export const SwitchDialog: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const focusedGroupId = useUiStore((s) => s.focusedGroupId);
  const addTask = useTasksStore((s) => s.addTask);

  const [title, setTitle] = useState("");

  const submit = () => {
    if (focusedGroupId) {
      addTask(focusedGroupId, title.trim(), true);
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
          <DialogTitle>Switch to another task</DialogTitle>
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
