import { useEffect, useRef } from "react";

interface ShortcutMapping {
  [key: string]: () => void;
}

interface UseShortcutsOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: EventTarget | null;
  enabled?: boolean;
}

export const useShortcuts = (
  shortcuts: ShortcutMapping,
  options: UseShortcutsOptions = {}
) => {
  const {
    preventDefault = true,
    stopPropagation = true,
    target = null,
    enabled = true,
  } = options;

  const shortcutsRef = useRef(shortcuts);

  // Update the ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Build the key combination string
      let keyCombo = "";

      if (ctrlKey) keyCombo += "ctrl+";
      if (metaKey) keyCombo += "cmd+";
      if (altKey) keyCombo += "alt+";
      if (shiftKey) keyCombo += "shift+";

      keyCombo += key.toLowerCase();

      const ignoredCombos = ["cmd+r"];

      // Also check for simple key without modifiers
      const simpleKey = key.toLowerCase();

      // Check if we have a handler for this key combination or simple key
      const handler =
        shortcutsRef.current[keyCombo] || shortcutsRef.current[simpleKey];

      if (handler && !ignoredCombos.includes(keyCombo)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }

        handler();
      }
    };

    // Determine the target element
    const targetElement = target || document;

    targetElement.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener(
        "keydown",
        handleKeyDown as EventListener
      );
    };
  }, [enabled, preventDefault, stopPropagation, target]);
};
