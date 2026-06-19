import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useNavigate } from "@tanstack/react-router";

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
      return false;
    },
  });
};
