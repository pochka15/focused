import { cn } from "@/lib/random/utils";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useState } from "react";

interface KeyPress {
  key: string;
  id: number;
  isFadingOut: boolean;
}

export const KeystrokesDisplay = () => {
  const [keys, setKeys] = useState<KeyPress[]>([]);

  useShortcuts({
    name: "keystrokes",
    enabled: true,
    keys: (_, event) => {
      const id = Date.now();
      setKeys((prev) => [
        ...prev,
        { key: formatKey(event), id, isFadingOut: false },
      ]);

      // Start fade-out animation after 1.5 seconds
      setTimeout(() => {
        setKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...k, isFadingOut: true } : k))
        );
      }, 1500);

      // Remove completely after 2 seconds
      setTimeout(() => {
        setKeys((it) => it.filter((x) => x.id !== id));
      }, 2000);

      return false;
    },
  });

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {keys.map((keyPress) => (
        <div
          key={keyPress.id}
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-black/80 px-4 py-2 font-mono text-lg text-white shadow-lg transition-opacity duration-200",
            keyPress.isFadingOut ? "opacity-0" : "opacity-100"
          )}
        >
          {keyPress.key}
        </div>
      ))}
    </div>
  );
};

const formatKey = (event: KeyboardEvent): string => {
  const parts: string[] = [];

  if (event.metaKey) parts.push("⌘");
  if (event.ctrlKey) parts.push("⌃");
  if (event.altKey) parts.push("⌥");
  if (event.shiftKey) parts.push("⇧");

  // Handle special keys
  const keyMap: Record<string, string> = {
    Enter: "↵",
    Backspace: "⌫",
    Delete: "⌦",
    Escape: "Escape",
    Tab: "⇥",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    " ": "Space",
  };

  const displayKey = keyMap[event.key] || event.key.toUpperCase();

  // Don't duplicate modifier keys
  if (
    ["Meta", "Control", "Alt", "Shift"].includes(event.key) &&
    parts.length > 0
  ) {
    return parts.join(" ");
  }

  parts.push(displayKey);
  return parts.join(" ");
};
