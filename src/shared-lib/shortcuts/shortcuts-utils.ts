const ruToEn: Record<string, string> = {
  ["й"]: "q",
  ["ц"]: "w",
  ["у"]: "e",
  ["к"]: "r",
  ["е"]: "t",
  ["н"]: "y",
  ["г"]: "u",
  ["ш"]: "i",
  ["щ"]: "o",
  ["з"]: "p",
  ["х"]: "[",
  ["ъ"]: "]",
  ["ф"]: "a",
  ["ы"]: "s",
  ["в"]: "d",
  ["а"]: "f",
  ["п"]: "g",
  ["р"]: "h",
  ["о"]: "j",
  ["л"]: "k",
  ["д"]: "l",
  ["ж"]: ";",
  ["э"]: "'",
  ["я"]: "z",
  ["ч"]: "x",
  ["с"]: "c",
  ["м"]: "v",
  ["и"]: "b",
  ["т"]: "n",
  ["ь"]: "m",
};

const isEscapeShortcut = (combo: string) =>
  combo === "Escape" || combo === "cmd+j";

const isColonShortcut = (combo: string) => combo === "shift+:";

const englishRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;
const transliterateRussian = (text: string): string => {
  if (englishRegex.test(text)) return text;
  return text
    .split("")
    .map((char) => ruToEn[char] || char)
    .join("");
};

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

  return transliterateRussian(combo);
};
