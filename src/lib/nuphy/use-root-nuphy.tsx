import { useState } from "react";
import { safeParseNumber } from "../random/utils";
import { useNuphy } from "./nuphy-provider";

type Mode = "default" | "deleting" | "reordering";

export const useRootNuphy = ({
  onSubmit,
}: {
  onSubmit: (order: number[]) => void;
}) => {
  const [mode, setMode] = useState<Mode>("default");
  const [order, setOrder] = useState<number[]>([]);
  const deleting = mode === "deleting";
  const reordering = mode === "reordering";
  const nonDefault = mode !== "default";

  const { sendEvent } = useNuphy({
    name: "root",
    keyHandler: (key) => {
      if (nonDefault) {
        if (key == "Escape") {
          setMode("default");
          setOrder([]);
        } else if (key === "Enter") {
          onSubmit(order);
          setMode("default");
          setOrder([]);
        } else {
          const n = safeParseNumber(key);
          if (n) setOrder((prev) => [...prev, n]);
        }
        return true;
      }

      switch (key) {
        case ":":
          sendEvent({ name: "set-command-mode", data: { isActive: true } });
          return true;
        case "d":
          setMode("deleting");
          return true;
        case "r":
          setMode("reordering");
          return true;
        case "h":
          sendEvent({
            name: "set-help",
            data: { isActive: true },
          });
          return true;
        case "n":
          sendEvent({
            name: "set-add-todo-mode",
            data: { isActive: true },
          });
          return true;
      }

      return nonDefault;
    },
  });
  return { deleting, order, reordering };
};
