import { usePlanningStore } from "@/lib/stores/planning-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

export const BacklogPanel = () => {
  const { enabled } = useShortcutsMode("editingBacklog");
  if (!enabled) return null;
  return <BacklogEditor />;
};

const BacklogEditor = () => {
  const storeBacklog = usePlanningStore((s) => s.backlog);
  const setStoreBacklog = usePlanningStore((s) => s.setBacklog);
  const [backlog, setBacklog] = useState(storeBacklog);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debouncedBacklog = useDebounce(backlog, 200);

  useEffect(() => {
    setStoreBacklog(debouncedBacklog);
  }, [debouncedBacklog, setStoreBacklog]);

  const { disableModes } = useShortcuts({
    name: "editingBacklog",
    enabled: true,
    keys: (key) => {
      if (key === "Escape") {
        setStoreBacklog(backlog);
        disableModes(["editingBacklog"]);
        return true;
      }
      return true;
    },
  });

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Backlog</h2>
        <button
          type="button"
          onClick={() => {
            setStoreBacklog(backlog);
            disableModes(["editingBacklog"]);
          }}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          Esc to close
        </button>
      </div>
      <textarea
        ref={textareaRef}
        autoFocus
        value={backlog}
        onChange={(e) => setBacklog(e.target.value)}
        className="bg-background text-foreground placeholder:text-muted-foreground flex-1 resize-none font-mono text-sm focus:outline-none"
        placeholder="<empty>"
        spellCheck={false}
      />
    </div>
  );
};
