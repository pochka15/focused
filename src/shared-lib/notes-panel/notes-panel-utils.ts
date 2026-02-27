const NOTES_KEY = "shortcuts-notes";

export const getNotes = (): string | undefined => {
  const savedNotes = localStorage.getItem(NOTES_KEY);
  if (savedNotes) {
    try {
      return JSON.parse(savedNotes);
    } catch {
      return savedNotes;
    }
  }
};

export const saveNotes = (notes: string) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};
