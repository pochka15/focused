import {
  acknowledgeNotification,
  getDueNotifications,
  getRepeatSuffix,
} from "@/lib/notifications/notifications-utils";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import type { Notification } from "@/lib/notifications/notifications-models";
import { Button, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, type FC, type PropsWithChildren } from "react";

function NotificationMessage({
  notification,
  onAck,
}: {
  notification: Notification;
  onAck: () => void;
}) {
  const descr = notification.notificationDescription?.trim() || "";
  const suffix = getRepeatSuffix(notification);
  return (
    <div>
      {(descr || suffix) && (
        <Text size="sm" mb="xs">
          {descr}
          {suffix}
        </Text>
      )}
      <Button size="xs" variant="filled" onClick={onAck}>
        OK
      </Button>
    </div>
  );
}

export const RootController: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useShortcutsMode("syncing");
  const editNotification = useNotificationsStore(
    (state) => state.editNotification
  );
  useRootShortcuts();

  useEffect(() => {
    if (!data?.lastUpdated) return;

    const allNotifications = useNotificationsStore.getState().notifications;
    const dueNotifications = getDueNotifications(allNotifications, 20);

    dueNotifications.forEach((notification) => {
      const id = `notification-${notification.id}`;

      const ack = () => {
        editNotification(acknowledgeNotification(notification));
        notifications.hide(id);
      };

      notifications.show({
        id,
        title: notification.notificationName,
        message: (
          <NotificationMessage notification={notification} onAck={ack} />
        ),
        autoClose: false,
        withCloseButton: true,
      });
    });
  }, [data?.lastUpdated, editNotification]);

  return <>{children}</>;
};
