import type {
  NewNotification,
  Notification,
} from "@/lib/notifications/notifications-models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface NotificationsState {
  notifications: Notification[];

  addNotification: (n: NewNotification) => void;
  editNotification: (n: Notification) => void;
  removeNotification: (id: string) => void;
  moveNotification: (id: string, direction: -1 | 1) => void;
  setNotifications: (notifications: Notification[]) => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    immer((set) => ({
      notifications: [],

      addNotification: (notification: NewNotification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: crypto.randomUUID(),
          };
          state.notifications.push(newNotification);
        }),

      editNotification: (notification: Notification) =>
        set((state) => {
          const index = state.notifications.findIndex(
            (n) => n.id === notification.id
          );
          if (index !== -1) {
            state.notifications[index] = notification;
          }
        }),

      removeNotification: (id: string) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      moveNotification: (id: string, direction: -1 | 1) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          const next = index + direction;
          if (next < 0 || next >= state.notifications.length) return;
          const a = state.notifications[index]!;
          state.notifications[index] = state.notifications[next]!;
          state.notifications[next] = a;
        }),

      setNotifications: (notifications: Notification[]) =>
        set((state) => {
          state.notifications = notifications;
        }),

      clear: () => {
        set((state) => {
          state.notifications = [];
        });
      },
    })),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure notifications are always arrays
        if (!state?.notifications || !Array.isArray(state.notifications)) {
          state!.notifications = [];
        }
      },
    }
  )
);
