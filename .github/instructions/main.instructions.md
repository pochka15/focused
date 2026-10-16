---
applyTo: "**/*.{ts,tsx}"
---

# Project coding standards for TypeScript / React

## General

- Prefer arrow functions.

## Styling (Tailwind + shadcn)

- **Prefer shadcn components / building blocks** (`Card`, `Badge`, `Input`, `Button`,
  `Skeleton`, `Switch`, …) over hand-rolled `div`s with custom border/padding/hover
  classes. Only write custom Tailwind for layout glue no component covers.
- **Tailwind class threshold:**
  - **Fewer than 5** classes → inline them directly in `className`.
  - **5 or more** classes → extract a `someStyles` variable using the `tw` tag
    (from `@/lib/utils`), wrapped freely to ~80 chars per line (not mandatory),
    applied via `cn(someStyles, …)`. The `tw` tag is a no-op at runtime — it just
    lets Prettier/ESLint find, sort, and lint the classes inside. Example:

    ```ts
    import { cn, tw } from "@/lib/utils"

    const cardStyles = tw`
      group rounded-lg border p-3 transition-colors
      hover:bg-accent
    `

    <div className={cn(cardStyles, isChosen && "border-primary bg-accent")} />
    ```

- **Extract reusable components** where it makes sense instead of duplicating JSX.
- Prefer theme tokens (`bg-accent`, `text-muted-foreground`, `border-primary`) over
  hard-coded palette colors (`bg-gray-50`, `border-pink-400`) so light/dark theming
  stays consistent.
