import { Router } from "express";
import { clusterFeedback } from "../ai/cluster.js";
import { analysisRequestSchema } from "../ai/schema.js";
import type { AppEnv } from "../env.js";
import type { AnalysisStore } from "../types.js";

export function analysesRouter(store: AnalysisStore, env: AppEnv) {
  const router = Router();

  router.get("/", async (req, res) => {
    const limit = clampLimit(req.query.limit);
    const analyses = await store.list(limit);
    res.json({ analyses });
  });

  router.post("/", async (req, res) => {
    const parsed = analysisRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Feedback must be 40–20,000 characters." });
      return;
    }
    const result = await clusterFeedback({
      feedbackText: parsed.data.feedbackText,
      apiKey: env.openAiKey,
      baseURL: env.baseURL,
      model: env.model,
    });
    const analysis = await store.insert({
      title: parsed.data.title?.trim() || "",
      feedbackText: parsed.data.feedbackText,
      result,
    });
    res.status(201).json({ analysis });
  });

  router.get("/:id", async (req, res) => {
    const analysis = await store.get(req.params.id);
    if (!analysis) {
      res.status(404).json({ error: "Analysis not found." });
      return;
    }
    res.json({ analysis });
  });

  router.delete("/:id", async (req, res) => {
    const removed = await store.remove(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Analysis not found." });
      return;
    }
    res.status(204).end();
  });

  return router;
}

function clampLimit(raw: unknown): number {
  const n = Number(raw ?? 20);
  if (!Number.isFinite(n)) return 20;
  return Math.min(50, Math.max(1, Math.floor(n)));
}
