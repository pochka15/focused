import type { Notification } from "@/lib/notifications/notifications-models";

const getMinutesUntil = (timeH: number, timeM: number): number => {
  const now = new Date();
  const target = new Date();
  target.setHours(timeH, timeM, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (60 * 1000));
};

const addMinutesToTime = (
  timeH: number,
  timeM: number,
  minutesToAdd: number
): { timeH: number; timeM: number } => {
  const date = new Date();
  date.setHours(timeH, timeM, 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return {
    timeH: date.getHours(),
    timeM: date.getMinutes(),
  };
};

const addMinutesFromNow = (
  minutesToAdd: number
): { timeH: number; timeM: number } => {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return {
    timeH: date.getHours(),
    timeM: date.getMinutes(),
  };
};

export const isNotificationDue = (
  notification: Notification,
  thresholdInMinutes = 10
): boolean => {
  if (notification.isComplete) {
    return false;
  }

  const minutesUntil = getMinutesUntil(notification.timeH, notification.timeM);
  return minutesUntil <= thresholdInMinutes;
};

export const getDueNotifications = (
  notifications: Notification[],
  thresholdInMinutes = 10
): Notification[] =>
  notifications.filter((notification) =>
    isNotificationDue(notification, thresholdInMinutes)
  );

export const postponeNotification = (
  notification: Notification,
  postponeInMinutes = 30
): Notification => {
  const minutesUntil = getMinutesUntil(notification.timeH, notification.timeM);
  const nextTime =
    minutesUntil < 0
      ? addMinutesFromNow(postponeInMinutes)
      : addMinutesToTime(
          notification.timeH,
          notification.timeM,
          postponeInMinutes
        );

  return {
    ...notification,
    ...nextTime,
    isComplete: false,
  };
};

export const acknowledgeNotification = (
  notification: Notification
): Notification => {
  if (notification.repeatsInMinutes > 0) {
    const minutesUntil = getMinutesUntil(
      notification.timeH,
      notification.timeM
    );
    const nextTime =
      minutesUntil < 0
        ? addMinutesFromNow(notification.repeatsInMinutes)
        : addMinutesToTime(
            notification.timeH,
            notification.timeM,
            notification.repeatsInMinutes
          );

    return {
      ...notification,
      ...nextTime,
      isComplete: false,
    };
  }

  return {
    ...notification,
    isComplete: true,
  };
};

export const getRepeatSuffix = (notification: Notification): string =>
  notification.repeatsInMinutes > 0
    ? ` (repeats every ${notification.repeatsInMinutes} min)`
    : "";
