import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useNavigate } from "@tanstack/react-router";
import { notesPanelRef } from "@/components/notes-panel/notes-panel-ref";

export const useRootShortcuts = () => {
  const navigate = useNavigate();
  const { enableMode } = useShortcuts({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      if (key === "r") {
        event.preventDefault();
        void navigate({ to: "/notifications" });
        return true;
      }
      if (key === "b") {
        event.preventDefault();
        void navigate({ to: "/backlog" });
        return true;
      }
      if (key === "t") {
        event.preventDefault();
        void navigate({ to: "/" });
        return true;
      }
      if (key === "s") {
        event.preventDefault();
        enableMode("syncing", { lastUpdated: Date.now() });
        return true;
      }
      if (key === ":") {
        event.preventDefault();
        notesPanelRef.current?.focus();
        return true;
      }
      return false;
    },
  });
};
