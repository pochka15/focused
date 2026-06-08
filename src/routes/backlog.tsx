import { BacklogView } from "@/components/backlog/backlog-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/backlog")({
  component: BacklogView,
});
