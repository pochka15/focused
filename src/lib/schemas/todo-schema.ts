import z from "zod";

export const todoSchema = z.object({
  name: z.string().min(1).trim(),
  priority: z.enum(["p1", "p2", "p3"]),
  tag: z.enum(["garbage", "nicely-done", "just-do-it"]),
  mode: z.enum(["deep", "light"]),
});

export type FTodo = z.infer<typeof todoSchema>;

export const getDefaultTodo = (): FTodo => ({
  name: "",
  priority: "p1",
  tag: "just-do-it",
  mode: "deep",
});
