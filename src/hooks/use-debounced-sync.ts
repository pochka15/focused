import { useCallback, useEffect, useRef, useState } from "react";

type UseDebouncedSyncOptions = {
  debounceMs?: number;
};

/**
 * Hook for managing local draft state with debounced persistence.
 * Guarantees no data loss on unmount by flushing pending changes immediately.
 *
 * @param initialValue - Initial draft value
 * @param onSave - Callback to persist the value (debounced)
 * @param options - Configuration options
 * @returns [draft, setDraft] - Draft state and setter
 */
export function useDebouncedSync(
  initialValue: string,
  onSave: (value: string) => void,
  options: UseDebouncedSyncOptions = {}
): [string, (value: string) => void] {
  const { debounceMs = 350 } = options;
  const [draft, setDraft] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingRef = useRef(draft);
  const initialValueRef = useRef(initialValue);

  // Track pending value
  useEffect(() => {
    pendingRef.current = draft;
  }, [draft]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pendingRef.current !== initialValueRef.current) {
        onSave(pendingRef.current);
        initialValueRef.current = pendingRef.current;
      }
    }, debounceMs);
  }, [onSave, debounceMs]);

  // Trigger debounce when draft changes
  useEffect(() => {
    debouncedSave();
  }, [draft, debouncedSave]);

  // Sync external value changes
  useEffect(() => {
    setDraft(initialValue);
    pendingRef.current = initialValue;
    initialValueRef.current = initialValue;
  }, [initialValue]);

  // Flush pending changes on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (pendingRef.current !== initialValueRef.current) {
        onSave(pendingRef.current);
      }
    };
  }, [onSave]);

  return [draft, setDraft];
}
