import { getKeysCombo } from "@/lib/random/keyboard-utils";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type FC,
  type PropsWithChildren,
} from "react";
import { useNuphyStore } from "../stores/nuphys-store";
import { nuphyPriorities, type KeyHandler, type KnownNuphy } from "./mappings";

type NuphyProviderContextType = {
  register: (name: KnownNuphy, handler: KeyHandler) => void;
  unregister: (name: KnownNuphy) => void;
};

const NuphyProviderContext = createContext<NuphyProviderContextType | null>(
  null
);

interface NuphyProviderProps {}

export const NuphyProvider: FC<PropsWithChildren<NuphyProviderProps>> = ({
  children,
}) => {
  const handlersRef = useRef<Map<KnownNuphy, KeyHandler>>(new Map());
  const activeNuphysRef = useRef<KnownNuphy[]>([]);

  const register = (name: KnownNuphy, handler: KeyHandler) => {
    handlersRef.current.set(name, handler);
    const filtered = activeNuphysRef.current.filter((n) => n !== name);
    const newList = [...filtered, name];
    activeNuphysRef.current = newList.sort(
      (a, b) => nuphyPriorities[b] - nuphyPriorities[a]
    );
  };

  const unregister = (name: KnownNuphy) => {
    handlersRef.current.delete(name);
    activeNuphysRef.current = activeNuphysRef.current.filter((n) => n !== name);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = getKeysCombo(event);
      if (combo === "cmd+j") event.preventDefault();

      activeNuphysRef.current.find((name) => {
        const handler = handlersRef.current.get(name);
        return handler && handler(combo, event);
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value: NuphyProviderContextType = { register, unregister };

  return (
    <NuphyProviderContext.Provider value={value}>
      {children}
    </NuphyProviderContext.Provider>
  );
};

interface UseNuphyOptions {
  name: KnownNuphy;
  enabled: boolean;
  keys: KeyHandler;
}

/**
 * Nuphy is like a keyboard listener. Just wanted to use this name.
 */
export const useNuphy = ({ name, enabled, keys }: UseNuphyOptions) => {
  const context = useContext(NuphyProviderContext);
  const disableModes = useNuphyStore((it) => it.disableModes);
  const enableMode = useNuphyStore((it) => it.enableMode);
  const getMode = useNuphyStore((it) => it.getMode);

  if (!context) {
    throw new Error("useNuphy must be used within a NuphyProvider");
  }

  const { register, unregister } = context;

  useEffect(() => {
    if (enabled) register(name, keys);
    else unregister(name);

    return () => {
      unregister(name);
    };
  }, [name, keys, enabled]);

  return { disableModes, enableMode, getMode };
};
