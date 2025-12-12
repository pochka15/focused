import { cn } from "@/lib/random/utils";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";

// TODO
export const Help = () => {
  const { isActive, sendEvent } = useNuphy({
    name: "help",
    keyHandler: (key) => {
      switch (key) {
        case "Escape":
          handleClose();
          return true;
      }
      return false;
    },
  });

  const handleClose = () => {
    sendEvent({ name: "set-help", data: { isActive: false } });
  };

  const paragraphs = [
    [":", "Enter command mode"],
    ["h", "Show help"],
    ["d", "Delete"],
    ["r", "Reorder"],
  ];

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-4 bottom-4 z-50 w-80 rounded-lg border p-4 shadow-lg",
        !isActive && "hidden"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Help</h2>
        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ×
        </button>
      </div>
      <div className="space-y-1 text-xs">
        {paragraphs.map((p, ind) => (
          <p key={ind}>
            <span className="bg-muted rounded px-1 font-mono text-xs">
              {p[0]}
            </span>{" "}
            {p[1]}
          </p>
        ))}
      </div>
    </div>
  );
};
