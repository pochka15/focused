import { Button } from "@mantine/core";
import { notifications, type NotificationsProps } from "@mantine/notifications";

export function showUndoNotification(
  id: string,
  message: string,
  onUndo: () => void,
  position: NotificationsProps["position"] = "bottom-right"
) {
  notifications.show({
    id,
    message: (
      <Button
        size="xs"
        variant="subtle"
        mt={4}
        onClick={() => {
          onUndo();
          notifications.hide(id);
        }}
      >
        Undo
      </Button>
    ),
    title: message,
    autoClose: 5000,
    withCloseButton: true,
    position,
  });
}
