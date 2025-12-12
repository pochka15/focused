import { getKeysCombo } from "@/lib/random/keyboard-utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import {
  handleEvent as importedHandleEvent,
  type KeyHandler,
  type KnownNuphys,
  type NuphyEvent,
} from "./mappings";

type NuphyProviderContextType = {
  register: (name: KnownNuphys, handler: KeyHandler) => void;
  unregister: (name: KnownNuphys) => void;
  activeNuphys: string[];
  handleEvent: (event: NuphyEvent) => void;
};

const dbg = (s: any) => {
  if (false) {
    console.log(s);
  }
};

const NuphyProviderContext = createContext<NuphyProviderContextType | null>(
  null
);

interface NuphyProviderProps {}

export const NuphyProvider: FC<PropsWithChildren<NuphyProviderProps>> = ({
  children,
}) => {
  const [nuphys, setNuphys] = useState<Map<KnownNuphys, KeyHandler>>(new Map());
  const [activeNuphys, setActiveNuphys] = useState<KnownNuphys[]>(["root"]);

  dbg(activeNuphys);

  const register = useCallback((name: KnownNuphys, handler: KeyHandler) => {
    setNuphys((prev) => new Map(prev).set(name, handler));
  }, []);

  const unregister = useCallback((name: KnownNuphys) => {
    setNuphys((prev) => {
      const newMap = new Map(prev);
      newMap.delete(name);
      return newMap;
    });
  }, []);

  const handleEvent = useCallback(
    (ev: NuphyEvent) => importedHandleEvent(ev, setActiveNuphys),
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyCombo = getKeysCombo(event);
      if (keyCombo === "cmd+j") event.preventDefault();

      // Iterate through active listeners in order
      for (const listenerName of activeNuphys) {
        const handler = nuphys.get(listenerName);
        if (handler) {
          const handled = handler(keyCombo);
          if (handled) {
            break; // Stop processing if handler returns true
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nuphys, activeNuphys]);

  const value: NuphyProviderContextType = useMemo(
    () => ({ activeNuphys, register, unregister, handleEvent }),
    [activeNuphys, register, unregister]
  );

  return (
    <NuphyProviderContext.Provider value={value}>
      {children}
    </NuphyProviderContext.Provider>
  );
};

interface UseNuphyOptions {
  name: KnownNuphys;
  keyHandler: KeyHandler;
}

interface UseNuphyReturn {
  isActive: boolean;
  sendEvent: (event: NuphyEvent) => void;
}

export const useNuphy = ({
  name,
  keyHandler,
}: UseNuphyOptions): UseNuphyReturn => {
  const context = useContext(NuphyProviderContext);

  if (!context) {
    throw new Error("useNuphy must be used within a NuphyProvider");
  }

  const {
    activeNuphys: activeListeners,
    register,
    unregister,
    handleEvent,
  } = context;

  useEffect(() => {
    register(name, keyHandler);

    return () => {
      unregister(name);
    };
  }, [name, register, unregister, keyHandler]);

  return {
    isActive: activeListeners.includes(name),
    sendEvent: handleEvent,
  };
};
