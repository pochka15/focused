export type NewNotification = {
  notificationName: string;
  timeH: number;
  timeM: number;
  repeatsInMinutes: number;
  isComplete: boolean;
};

export type Notification = NewNotification & {
  id: string;
};
