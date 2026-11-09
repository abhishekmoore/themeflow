import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import type { AppEnv } from "./env.js";
import { analysesRouter } from "./routes/analyses.js";
import type { AnalysisStore, HealthInfo } from "./types.js";

export function createApp(store: AnalysisStore, env: AppEnv, storeKind: HealthInfo["store"]) {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    const body: HealthInfo = {
      ok: true,
      store: storeKind,
      ai: env.openAiKey ? "model" : "heuristic",
      model: env.openAiKey ? env.model : null,
    };
    res.json(body);
  });

  app.use("/api/analyses", analysesRouter(store, env));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    res.status(500).json({ error: message });
  });

  return app;
}
