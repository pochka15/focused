import type { FC, PropsWithChildren } from "react";
import { useRootNuphy } from "./use-root-nuphy";

export const RootNuphy: FC<PropsWithChildren> = ({ children }) => {
  useRootNuphy();
  return children;
};
