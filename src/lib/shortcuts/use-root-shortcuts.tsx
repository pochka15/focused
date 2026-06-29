import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useNavigate } from "@tanstack/react-router";
import { ROOT_SHORTCUTS } from "./shortcut-mappings";

export const useRootShortcuts = () => {
  const navigate = useNavigate();
  const helpMode = useShortcutsMode("help");
  const { enableMode, disableModes } = useShortcuts({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      if (key === ROOT_SHORTCUTS.help) {
        event.preventDefault();

        if (helpMode.enabled) {
          disableModes(["help"]);
          return true;
        }

        enableMode("help");
        return true;
      }

      if (key === ROOT_SHORTCUTS.notifications) {
        event.preventDefault();
        void navigate({ to: "/notifications" });
        return true;
      }
      if (key === ROOT_SHORTCUTS.backlog) {
        event.preventDefault();
        void navigate({ to: "/backlog" });
        return true;
      }
      if (key === ROOT_SHORTCUTS.timeline) {
        event.preventDefault();
        void navigate({ to: "/" });
        return true;
      }
      if (key === ROOT_SHORTCUTS.syncing) {
        event.preventDefault();
        enableMode("syncing", { lastUpdated: Date.now() });
        return true;
      }
      return false;
    },
  });
};
