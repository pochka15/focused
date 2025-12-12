import type { Dispatch, SetStateAction } from "react";
import { prepended, withoutItem } from "../random/array-utils";

export type KeyHandler = (key: string) => boolean;

export const knownNuphys = {
  root: "root",
  help: "help",
  command: "command",
  addTodo: "addTodo",
} as const;

export type KnownNuphys = keyof typeof knownNuphys;

export type NuphyEvent =
  | {
      name: "set-help";
      data: { isActive: boolean };
    }
  | {
      name: "set-command-mode";
      data: { isActive: boolean };
    }
  | {
      name: "set-add-todo-mode";
      data: { isActive: boolean };
    };

export const handleEvent = (
  event: NuphyEvent,
  setActiveNuphys: Dispatch<SetStateAction<KnownNuphys[]>>
) => {
  switch (event.name) {
    case "set-help":
      setActiveNuphys((prev) =>
        event.data.isActive
          ? prepended(prev, knownNuphys.help)
          : withoutItem(prev, knownNuphys.help)
      );
      break;
    case "set-command-mode":
      setActiveNuphys((prev) =>
        event.data.isActive
          ? prepended(prev, knownNuphys.command)
          : withoutItem(prev, knownNuphys.command)
      );
      break;
    case "set-add-todo-mode":
      setActiveNuphys((prev) =>
        event.data.isActive
          ? prepended(prev, knownNuphys.addTodo)
          : withoutItem(prev, knownNuphys.addTodo)
      );
      break;
  }
};
