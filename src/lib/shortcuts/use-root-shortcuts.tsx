import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import type { ModeName, SelectOperation } from "./shortcuts-modes";
import { helpCommands, type HelpCommandKey } from "@/components/help";

export const useRootShortcuts = () => {
  const { enableMode } = useShortcuts({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      const keyModeMap: Record<HelpCommandKey, ModeName> = {
        [helpCommands.command.key]: "showingCommand",
        [helpCommands.archive.key]: "selectingTodos",
        [helpCommands.edit.key]: "selectingTodos",
        [helpCommands.sync.key]: "syncing",
        [helpCommands.help.key]: "showingHelp",
        [helpCommands.notes.key]: "showingNotes",
        [helpCommands.notifications.key]: "editingNotifications",
      };

      const name = keyModeMap[key];
      if (name) {
        event.preventDefault();

        if (name === "syncing") {
          enableMode(name, { lastUpdated: Date.now() });
        } else if (name === "selectingTodos") {
          const operationMap: Record<HelpCommandKey, SelectOperation> = {
            [helpCommands.edit.key]: "edit",
            // [helpCommands.reorder.key]: "reorder",
            [helpCommands.archive.key]: "archive",
          };

          const operation = operationMap[key];
          if (!operation) {
            throw new Error("Invalid operation");
          }

          enableMode(name, { order: [], operation });
        } else {
          enableMode(name);
        }
      }

      return !!name;
    },
  });
};
