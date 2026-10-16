import { useEffect, type RefObject } from "react";

/**
 * Focuses `ref` one tick after `active` turns on. Dialogs here open from a
 * plain-key shortcut (e.g. `n`); focusing synchronously during that keydown
 * would let the key's character land in the freshly focused input.
 */
export const useDeferredFocus = (
  ref: RefObject<HTMLElement | null>,
  active: boolean
) => {
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => ref.current?.focus());
    return () => window.clearTimeout(id);
  }, [ref, active]);
};
