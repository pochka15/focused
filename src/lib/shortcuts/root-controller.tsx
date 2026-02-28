import { useEffect, type FC, type PropsWithChildren } from "react";
import { toast } from "sonner";
import {
  acknowledgeNotification,
  getDueNotifications,
  getNotificationDisplayDescription,
  getRepeatSuffix,
  postponeNotification,
} from "@/lib/notifications/notifications-utils";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";

export const RootController: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useShortcutsMode("syncing");
  const editNotification = useNotificationsStore(
    (state) => state.editNotification
  );
  useRootShortcuts();

  useEffect(() => {
    if (!data?.lastUpdated) {
      return;
    }

    const notifications = useNotificationsStore.getState().notifications;
    const dueNotifications = getDueNotifications(notifications, 10);

    dueNotifications.forEach((notification) => {
      const toastDescription = `${getNotificationDisplayDescription(notification)}${getRepeatSuffix(notification)}`;

      toast(notification.notificationName, {
        id: `notification-${notification.id}`,
        description: toastDescription,
        duration: Infinity,
        closeButton: true,
        action: {
          label: "OK",
          onClick: () => {
            editNotification(acknowledgeNotification(notification));
          },
        },
        cancel: {
          label: "+30m",
          onClick: () => {
            editNotification(postponeNotification(notification, 30));
          },
        },
      });
    });
  }, [data?.lastUpdated, editNotification]);
  return children;
};
