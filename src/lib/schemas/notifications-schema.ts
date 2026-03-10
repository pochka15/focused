import type {
  NewNotification,
  Notification,
} from "@/lib/notifications/notifications-models";
import {
  formatRepeatDuration,
  isValidRepeatDuration,
  parseRepeatDuration,
} from "@/lib/notifications/repeat-duration-utils";
import z from "zod";

export const notificationRowSchema = z.object({
  id: z.string().optional(),
  notificationName: z.string().min(1, "Name is required").trim(),
  timeH: z.number().min(0).max(23),
  timeM: z.number().min(0).max(59),
  repeatsInMinutes: z
    .string()
    .trim()
    .refine(
      (value) => isValidRepeatDuration(value),
      "Use format like 1h 20m, 1h20m, 20m, or 2h"
    ),
  isComplete: z.boolean(),
  notificationDescription: z.string(),
});

export type FNotificationRow = z.infer<typeof notificationRowSchema>;

export const notificationsSchema = z.object({
  rows: z.array(notificationRowSchema),
});

export type FNotifications = z.infer<typeof notificationsSchema>;

export const getDefaultNotificationRow = (): FNotificationRow => ({
  notificationName: "",
  timeH: 9,
  timeM: 0,
  repeatsInMinutes: "0m",
  isComplete: false,
  notificationDescription: "",
});

export const getDefaultNotifications = (
  notifications?: Notification[]
): FNotifications => ({
  rows: notifications?.map(fromNotification) ?? [],
});

export const fromNewNotification = (
  notification: NewNotification
): FNotificationRow => ({
  notificationName: notification.notificationName,
  timeH: notification.timeH,
  timeM: notification.timeM,
  repeatsInMinutes: formatRepeatDuration(notification.repeatsInMinutes),
  isComplete: notification.isComplete,
  notificationDescription: notification.notificationDescription ?? "",
});

export const fromNotification = (
  notification: Notification
): FNotificationRow => ({
  id: notification.id,
  notificationName: notification.notificationName,
  timeH: notification.timeH,
  timeM: notification.timeM,
  repeatsInMinutes: formatRepeatDuration(notification.repeatsInMinutes),
  isComplete: notification.isComplete,
  notificationDescription: notification.notificationDescription ?? "",
});

export const toNewNotification = (row: FNotificationRow): NewNotification => ({
  notificationName: row.notificationName,
  timeH: row.timeH,
  timeM: row.timeM,
  repeatsInMinutes: parseRepeatDuration(row.repeatsInMinutes) ?? 0,
  isComplete: row.isComplete,
  notificationDescription: row.notificationDescription || undefined,
});
