import {
  acknowledgeNotification,
  getDueNotifications,
  getRepeatSuffix,
} from "@/lib/notifications/notifications-utils";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import type { Notification } from "@/lib/notifications/notifications-models";
import { useEffect, type FC, type PropsWithChildren } from "react";
import { toast } from "sonner";

const getNotificationMessage = (notification: Notification) => {
  const descr = notification.notificationDescription?.trim() || "";
  const suffix = getRepeatSuffix(notification);
  return descr || suffix ? `${descr}${suffix}` : undefined;
};

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
        toast.dismiss(id);
      };

      toast(notification.notificationName, {
        id,
        description: getNotificationMessage(notification),
        duration: Infinity,
        closeButton: true,
        action: { label: "OK", onClick: ack },
      });
    });
  }, [data?.lastUpdated, editNotification]);

  return <>{children}</>;
};
