import {
  formatCapturedTask,
  useCaptureStore,
} from "@/lib/stores/capture-store";
import { useState } from "react";

export const QueueIndicator = () => {
  const queue = useCaptureStore((s) => s.queue);
  const clearQueue = useCaptureStore((s) => s.clearQueue);
  const [showTooltip, setShowTooltip] = useState(false);

  if (queue.length === 0) return null;

  const handleClick = () => {
    const text = queue.map(formatCapturedTask).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setShowTooltip(true);
  };

  const handleClear = () => {
    clearQueue();
    setShowTooltip(false);
  };

  const handleKeep = () => {
    setShowTooltip(false);
  };

  return (
    <div className="fixed top-1/2 right-4 z-50 flex -translate-y-1/2 flex-col items-center gap-2">
      <button
        onClick={handleClick}
        className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-md transition-opacity hover:opacity-80"
        title="Copy queued tasks"
      >
        {queue.length}
      </button>

      {showTooltip && (
        <div className="bg-popover border-border text-popover-foreground flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-lg">
          <p className="font-medium">Copied!</p>
          <p className="text-muted-foreground">Clear queue?</p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs"
            >
              Yes
            </button>
            <button
              onClick={handleKeep}
              className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs"
            >
              Keep
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
