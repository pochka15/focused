export { cn } from "cn";

/** No-op template tag so Prettier/ESLint can find & sort Tailwind classes. */
export const tw = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);
