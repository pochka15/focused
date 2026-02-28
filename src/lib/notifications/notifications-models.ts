export type NewNotification = {
  notificationName: string;
  timeH: number;
  timeM: number;
  repeatsInMinutes: number;
  isComplete: boolean;
  notificationDescription?: string;
  isCurrentlyShowing?: boolean;
};

export type Notification = NewNotification & {
  id: string;
};
