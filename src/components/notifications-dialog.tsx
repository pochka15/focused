import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";

export const NotificationsDialog = () => {
  const { enabled: isOpen } = useShortcutsMode("editingNotifications");

  const { enableMode, disableModes } = useShortcuts({
    name: "notificationsDialog",
    enabled: true,
    keys: (key, event) => {
      return isOpen;
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) disableModes(["editingNotifications"]);
      }}
    >
      <DialogContent className="min-w-1/3">
        <DialogHeader>
          <DialogTitle>Task</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div>Hello world</div>
      </DialogContent>
    </Dialog>
  );
};
