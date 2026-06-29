import { Box, Textarea } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { TIMELINE_NOTES_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import classes from "./timeline-view.module.css";

type Props = {
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
};

const SAVE_DEBOUNCE_MS = 350;

export const TimelineNotesTab = ({
  value,
  onChange,
  active,
  onClose,
}: Props) => {
  const [draft, setDraft] = useState(value);
  const [debouncedDraft] = useDebouncedValue(draft, SAVE_DEBOUNCE_MS);
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  // Last onChange before unmount in case debouncedDraft hasn't been flushed yet
  useEffect(() => {
    return () => onChange(draft);
  }, []);

  useEffect(() => {
    onChange(debouncedDraft);
  }, [debouncedDraft]);

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
    <Box className={classes.notesPanel}>
      <Textarea
        data-autofocus
        ref={internalRef}
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        placeholder="Write freely..."
        variant="unstyled"
        autosize
        minRows={18}
        classNames={{ input: classes.notesInput }}
      />
    </Box>
  );
};
