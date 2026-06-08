import { useState } from "react";

export function useSimpleForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);

  const field = <K extends keyof T>(key: K) => ({
    value: values[key],
    onChange: (v: T[K]) => setValues((prev) => ({ ...prev, [key]: v })),
  });

  const reset = () => setValues(initial);

  return { values, field, setValues, reset };
}
