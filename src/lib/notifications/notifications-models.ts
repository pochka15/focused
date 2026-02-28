export type NewNotification = {
  notificationName: string;
  timeH: number;
  timeM: number;
  repeatsInMinutes: number;
  isComplete: boolean;
  notificationDescription?: string;
};

export type Notification = NewNotification & {
  id: string;
};
