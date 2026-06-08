import { NotificationsView } from "@/components/notifications/notifications-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications")({
  component: NotificationsView,
});
