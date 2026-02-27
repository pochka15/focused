import { useShortcutsStore } from "@/shared-lib/shortcuts/shortcuts-store";
import { createContext, useContext, useEffect } from "react";
import type { KeyHandler, KnownShortcutsListener } from "./shortcuts-glue";

export type ShortcutsProviderValue = {
  register: (name: KnownShortcutsListener, handler: KeyHandler) => void;
  unregister: (name: KnownShortcutsListener) => void;
};

export const ShortcutsProviderContext =
  createContext<ShortcutsProviderValue | null>(null);

interface UseShortcutsOptions {
  name: KnownShortcutsListener;
  enabled: boolean;
  keys: KeyHandler;
}

export const useShortcuts = ({ name, enabled, keys }: UseShortcutsOptions) => {
  const context = useContext(ShortcutsProviderContext);
  const disableModes = useShortcutsStore((it) => it.disableModes);
  const enableMode = useShortcutsStore((it) => it.enableMode);
  const getMode = useShortcutsStore((it) => it.getMode);

  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider");
  }

  const { register, unregister } = context;

  useEffect(() => {
    if (enabled) register(name, keys);
    else unregister(name);
  }, [name, keys, enabled, register, unregister]);

  useEffect(() => {
    return () => {
      unregister(name);
    };
  }, [unregister, name]);

  return { disableModes, enableMode, getMode };
};
