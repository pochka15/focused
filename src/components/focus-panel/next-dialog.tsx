import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useState, type FC } from "react";

export const NextDialog: FC<{
  open: boolean;
  onClose: () => void;
  groupId?: string | null;
}> = ({ open, onClose, groupId }) => {
  const addNextTask = useTasksStore((s) => s.addNextTask);

  const [title, setTitle] = useState("");

  const submit = () => {
    if (groupId) {
      addNextTask(groupId, title.trim());
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
          <DialogTitle>New task</DialogTitle>
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
