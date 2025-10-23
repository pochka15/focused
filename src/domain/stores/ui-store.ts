import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UiState {
  focusedGroupId: string | null;
  nextGroupId: string | null;
  breakTime: Date | string | null; // When the break should be taken (Date or string from localStorage)

  setFocusedGroup: (groupId: string | null) => void;
  setNextGroup: (groupId: string | null) => void;
  setBreakTime: (breakTime: Date | null) => void;
  getMinutesLeft: () => number;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      focusedGroupId: null,
      nextGroupId: null,
      breakTime: null,

      setFocusedGroup: (groupId: string | null) =>
        set({ focusedGroupId: groupId }),

      setNextGroup: (groupId: string | null) => set({ nextGroupId: groupId }),

      setBreakTime: (breakTime: Date | null) => set({ breakTime }),

      getMinutesLeft: () => {
        const { breakTime } = get();
        if (!breakTime) return 0;
        const now = new Date();
        // Convert breakTime to Date if it's a string (from localStorage)
        const breakTimeDate =
          typeof breakTime === "string" ? new Date(breakTime) : breakTime;
        const diff = breakTimeDate.getTime() - now.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60)));
      },
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
