"use client";

import { shortcutsPriorities } from "@/lib/shortcuts/shortcuts-priorities";
import { useShortcutsStore } from "@/shared-lib/shortcuts/shortcuts-store";
import { getKeysCombo } from "@/shared-lib/shortcuts/shortcuts-utils";
import { useEffect, useRef, type FC, type PropsWithChildren } from "react";
import type { KeyHandler, KnownShortcutsListener } from "./shortcuts-glue";
import {
  ShortcutsProviderContext,
  type ShortcutsProviderValue,
} from "./use-shortcuts";

export const ShortcutsProvider: FC<PropsWithChildren> = ({ children }) => {
  const handlersRef = useRef<Map<KnownShortcutsListener, KeyHandler>>(
    new Map()
  );
  const listenersRef = useRef<Set<KnownShortcutsListener>>(new Set());
  const sortedListenersRef = useRef<KnownShortcutsListener[]>([]);
  const setActiveListeners = useShortcutsStore((it) => it.setActiveListeners);

  const updActive = (name: KnownShortcutsListener, rm: boolean) => {
    if (rm) listenersRef.current.delete(name);
    else listenersRef.current.add(name);

    sortedListenersRef.current = Array.from(listenersRef.current).sort(
      (a, b) => shortcutsPriorities[a] - shortcutsPriorities[b]
    );

    return sortedListenersRef.current;
  };

  const register = (name: KnownShortcutsListener, handler: KeyHandler) => {
    handlersRef.current.set(name, handler);
    const hadBefore = listenersRef.current.has(name);
    if (!hadBefore) setActiveListeners(updActive(name, false));
  };

  const unregister = (name: KnownShortcutsListener) => {
    handlersRef.current.delete(name);
    const hadBefore = listenersRef.current.has(name);
    if (hadBefore) setActiveListeners(updActive(name, true));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = getKeysCombo(event);
      if (combo === "cmd+j" || combo === "alt+j") event.preventDefault();

      sortedListenersRef.current.find((name) => {
        const handler = handlersRef.current.get(name);
        return handler && handler(combo, event);
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value: ShortcutsProviderValue = { register, unregister };

  return (
    <ShortcutsProviderContext.Provider value={value}>
      {children}
    </ShortcutsProviderContext.Provider>
  );
};
