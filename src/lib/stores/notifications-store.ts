import type {
  NewNotification,
  Notification,
} from "@/lib/notifications/notifications-models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface NotificationsState {
  notifications: Notification[];

  getNotifications: () => Notification[];
  addNotification: (n: NewNotification) => void;
  editNotification: (n: Notification) => void;
  bulkDelete: (ids: string[]) => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    immer((set, get) => ({
      notifications: [],

      getNotifications: () => get().notifications,

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

      bulkDelete: (ids: string[]) =>
        set((state) => {
          const idsSet = new Set(ids);
          state.notifications = state.notifications.filter(
            (n) => !idsSet.has(n.id)
          );
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
