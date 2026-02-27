"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/random/utils";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useEffect, useRef, useState } from "react";
import { getNotes, saveNotes } from "./notes-panel-utils";

export const NotesPanel = () => {
  const { enabled } = useShortcutsMode("showingNotes");
  const [notes, setNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (enabled) {
      const savedNotes = getNotes();
      if (savedNotes) {
        setNotes(savedNotes);
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
    saveNotes(notes);
    disableModes(["showingNotes"]);
  };

  const { disableModes } = useShortcuts({
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
