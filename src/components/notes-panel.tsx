import { Textarea } from "@/components/ui/textarea";
import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { cn } from "@/lib/random/utils";
import { useNuphyMode } from "@/lib/stores/nuphys-store";
import { useEffect, useRef, useState } from "react";

const NOTES_KEY = "focused-notes";

export const NotesPanel = () => {
  const { enabled } = useNuphyMode("showingNotes");
  const [notes, setNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (enabled) {
      const savedNotes = localStorage.getItem(NOTES_KEY);
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch {
          setNotes(savedNotes);
        }
      }

      if (textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }
  }, [enabled]);

  const saveAndClose = () => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    disableModes(["showingNotes"]);
  };

  const { disableModes } = useNuphy({
    name: "notesPanel",
    enabled,
    keys: (key) => {
      if (key === "Escape") {
        saveAndClose();
      }
      return true;
    },
  });

  return (
    <div
      className={cn(
        "border-border bg-background fixed bottom-0 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 rounded-t-lg border p-4 shadow-lg transition-transform",
        enabled ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Quick Note</h2>
        <button
          onClick={saveAndClose}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ×
        </button>
      </div>
      <Textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type your notes here..."
        className="min-h-[200px] resize-none"
      />
    </div>
  );
};
