import { cn } from "@/lib/random/utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";

export const helpCommands = {
  command: {
    key: ":",
    description: "Enter command mode",
  },
  help: {
    key: "h",
    description: "Show help",
  },
  archive: {
    key: "d",
    description: "Delete",
  },
  sync: {
    key: "s",
    description: "Sync",
  },
  edit: {
    key: "e",
    description: "Edit item",
  },
  newTodo: {
    key: "n",
    description: "New todo",
  },
  notes: {
    key: "j",
    description: "Quick note",
  },
  notifications: {
    key: "r",
    description: "Edit notifications",
  },
};

export type HelpCommandKey =
  (typeof helpCommands)[keyof typeof helpCommands]["key"];

export const Help = () => {
  const { enabled } = useShortcutsMode("showingHelp");

  const { disableModes } = useShortcuts({
    name: "help",
    enabled,
    keys: (key) => {
      const esc = key === "Escape";
      if (esc) disableModes(["showingHelp"]);
      return esc;
    },
  });

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-4 bottom-4 z-50 w-80 rounded-lg border p-4 shadow-lg",
        !enabled && "hidden"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Help</h2>
        <button
          onClick={() => disableModes(["showingHelp"])}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ×
        </button>
      </div>
      <div className="space-y-1 text-xs">
        {Object.values(helpCommands).map((it, ind) => (
          <p key={ind}>
            <span className="bg-muted rounded px-1 font-mono text-xs">
              {it.key}
            </span>{" "}
            {it.description}
          </p>
        ))}
      </div>
    </div>
  );
};
