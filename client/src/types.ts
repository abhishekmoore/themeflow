export type ResultSource = "model" | "heuristic";

export interface Theme {
  name: string;
  quotes: string[];
  action: string;
}

export interface ThemeResult {
  themes: Theme[];
  source: ResultSource;
  model?: string;
}

export interface AnalysisRecord {
  id: string;
  title: string;
  feedbackText: string;
  result: ThemeResult;
  createdAt: string;
}

export interface HealthInfo {
  ok: true;
  store: "memory" | "mongo";
  ai: "model" | "heuristic";
  model: string | null;
}
