import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { cn } from "@/lib/random/utils";
import { useNuphyMode } from "@/lib/stores/nuphys-store";

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
  reorder: {
    key: "r",
    description: "Reorder",
  },
  focus: {
    key: "f",
    description: "Focus item",
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
};

export type HelpCommandKey =
  (typeof helpCommands)[keyof typeof helpCommands]["key"];

export const Help = () => {
  const { enabled } = useNuphyMode("showingHelp");

  const { disableModes } = useNuphy({
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
