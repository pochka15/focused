import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { Box, Textarea } from "@mantine/core";
import { useState } from "react";
import { notesPanelRef } from "./notes-panel-ref";
import classes from "./notes-panel.module.css";

export function NotesPanel() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  useShortcuts({
    name: "notesPanel",
    enabled: true,
    keys: (key) => {
      if (focused && key === "Escape") {
        notesPanelRef.current?.blur();
        setFocused(false);
      }

      return focused;
    },
  });

  return (
    <Box className={classes.panel}>
      <Textarea
        ref={(el) => {
          notesPanelRef.current = el;
        }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Quick notes… (: to focus)"
        autosize
        minRows={1}
        maxRows={4}
        classNames={{ input: classes.input }}
      />
    </Box>
  );
}
