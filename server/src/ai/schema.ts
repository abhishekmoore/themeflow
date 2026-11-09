import { z } from "zod";

const themeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quotes: z.array(z.string().trim().min(1).max(500)).min(1).max(8),
  action: z.string().trim().min(1).max(300),
});

export const modelResultSchema = z.object({
  themes: z.array(themeSchema).min(3).max(6),
});

export type ModelResult = z.infer<typeof modelResultSchema>;

export const analysisRequestSchema = z.object({
  feedbackText: z.string().trim().min(40).max(20000),
  title: z.string().trim().max(120).optional(),
});
