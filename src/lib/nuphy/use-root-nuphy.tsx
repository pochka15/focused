import { helpCommands, type HelpCommandKey } from "@/components/help";
import { type ModeName, type SelectOperation } from "@/lib/stores/nuphys-store";
import { useNuphy } from "./nuphy-provider";

export const useRootNuphy = () => {
  const { enableMode, disableModes } = useNuphy({
    name: "root",
    enabled: true,
    keys: (key, event) => {
      const keyModeMap: Record<HelpCommandKey, ModeName> = {
        [helpCommands.command.key]: "showingCommand",
        [helpCommands.archive.key]: "selectingTodos",
        [helpCommands.reorder.key]: "selectingTodos",
        [helpCommands.edit.key]: "selectingTodos",
        [helpCommands.newTodo.key]: "editingTodo",
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
          if (key === helpCommands.newTodo.key) {
            disableModes(["selectingTodos"]);
          }
          enableMode(name);
        }
      }

      return !!name;
    },
  });
};
