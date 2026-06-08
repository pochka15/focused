import { TimelineView } from "@/components/timeline/timeline-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TimelineView,
});
