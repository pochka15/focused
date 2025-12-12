import z from "zod";

export const todoSchema = z.object({
  name: z.string().min(1).trim(),
  urgencyLvl: z.enum(["urgent", "normal", "evening"]),
  tag: z.enum(["garbage", "nicely-done", "just-do-it"]),
  mode: z.enum(["deep", "light"]),
});

export type FTodo = z.infer<typeof todoSchema>;

export const getDefaultTodo = (): FTodo => ({
  name: "",
  urgencyLvl: "normal",
  tag: "just-do-it",
  mode: "light",
});
