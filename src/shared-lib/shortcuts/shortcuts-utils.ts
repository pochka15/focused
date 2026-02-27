const isEscapeShortcut = (combo: string) =>
  combo === "Escape" || combo === "cmd+j";

const isColonShortcut = (combo: string) => combo === "shift+:";

export const getKeysCombo = (event: KeyboardEvent) => {
  const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
  let combo = "";
  if (ctrlKey) combo += "ctrl+";
  if (metaKey) combo += "cmd+";
  if (altKey) combo += "alt+";
  if (shiftKey) combo += "shift+";
  combo += key;

  if (isColonShortcut(combo)) return ":";
  if (isEscapeShortcut(combo)) return "Escape";
  return combo;
};
