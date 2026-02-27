import type { FC, PropsWithChildren } from "react";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";

export const RootShortcuts: FC<PropsWithChildren> = ({ children }) => {
  useRootShortcuts();
  return children;
};
