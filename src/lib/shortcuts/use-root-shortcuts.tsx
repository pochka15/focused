import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import type { ModeName, SelectOperation } from "./shortcuts-modes";
import { helpCommands, type HelpCommandKey } from "@/components/help";

export const useRootShortcuts = () => {
  const { enableMode, disableModes } = useShortcuts({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      const keyModeMap: Record<HelpCommandKey, ModeName> = {
        [helpCommands.command.key]: "showingCommand",
        [helpCommands.archive.key]: "selectingTodos",
        [helpCommands.reorder.key]: "selectingTodos",
        [helpCommands.edit.key]: "selectingTodos",
        [helpCommands.help.key]: "showingHelp",
        [helpCommands.notes.key]: "showingNotes",
      };

      const name = keyModeMap[key];
      if (name) {
        event.preventDefault();

        if (name === "selectingTodos") {
          const operationMap: Record<HelpCommandKey, SelectOperation> = {
            [helpCommands.edit.key]: "edit",
            [helpCommands.reorder.key]: "reorder",
            [helpCommands.archive.key]: "archive",
          };

          const operation = operationMap[key];
          if (!operation) {
            throw new Error("Invalid operation");
          }

          disableModes(["focusing"]);
          enableMode(name, { order: [], operation });
        } else {
          enableMode(name);
        }
      }

      return !!name;
    },
  });
};
