import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import { useDebouncedSync } from "@/hooks/use-debounced-sync";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { TIMELINE_NOTES_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";

type Props = {
  active: boolean;
  onClose: () => void;
};

export const TimelineNotesTab = ({ active, onClose }: Props) => {
  const notesText = useTimelineStore((s) => s.notesText);
  const setNotesText = useTimelineStore((s) => s.setNotesText);
  const [draft, setDraft] = useDebouncedSync(notesText, setNotesText, {
    debounceMs: 350,
  });
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (active) {
      internalRef.current?.focus();
    }
  }, [active]);

  useShortcuts({
    name: "timelineNotes",
    enabled: active,
    keys: (key, event) => {
      if (key === TIMELINE_NOTES_SHORTCUTS.close) {
        event.preventDefault();
        onClose();
        return true;
      }
      return document.activeElement === internalRef.current;
    },
  });

  return (
    <div className="mx-auto w-full max-w-215 px-2 pt-4 pb-8">
      <Textarea
        ref={internalRef}
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        placeholder="Write freely..."
        className="min-h-[68vh] border-b-transparent text-lg tracking-[0.01em] md:text-lg"
      />
    </div>
  );
};
