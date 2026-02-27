import {
  getDefaultModes,
  type ModeName,
  type Modes,
} from "@/lib/shortcuts/shortcuts-modes";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { KnownShortcutsListener } from "./shortcuts-glue";

const getDefaultMode = <T extends ModeName>(name: T): Modes[T] =>
  getDefaultModes()[name];

interface ShortcutsState {
  modes: Modes;
  activeListeners: KnownShortcutsListener[];

  enableMode: <T extends ModeName>(name: T, data?: Modes[T]["data"]) => void;
  disableModes: (names: ModeName[]) => void;
  getMode: <T extends ModeName>(name: T) => Modes[T];
  setActiveListeners: (active: KnownShortcutsListener[]) => void;
}

export const useShortcutsStore = create<ShortcutsState>()(
  immer((set, get) => ({
    modes: getDefaultModes(),
    activeListeners: [],

    getMode: (name) => get().modes[name],

    enableMode: (name, data) =>
      set((state) => {
        state.modes[name] = { ...getDefaultMode(name), enabled: true, data };
      }),

    disableModes: (names) =>
      set((state) => {
        for (const n of names) state.modes[n].enabled = false;
      }),

    // Should only be called by the ShortcutsProvider
    setActiveListeners: (active) =>
      set((state) => {
        state.activeListeners = active;
      }),
  }))
);

export const useShortcutsMode = <T extends ModeName>(name: T): Modes[T] => {
  return useShortcutsStore((it) => it.modes[name]);
};
