import {
  acknowledgeNotification,
  getDueNotifications,
  getRepeatSuffix,
  postponeNotification,
} from "@/lib/notifications/notifications-utils";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useEffect, type FC, type PropsWithChildren } from "react";
import { toast } from "sonner";

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
      const descr = notification.notificationDescription?.trim() || "";
      const toastDescription = `${descr}${getRepeatSuffix(notification)}`;

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
