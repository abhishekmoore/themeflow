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

export interface NewAnalysis {
  title: string;
  feedbackText: string;
  result: ThemeResult;
}

export interface AnalysisStore {
  insert(analysis: NewAnalysis): Promise<AnalysisRecord>;
  list(limit: number): Promise<AnalysisRecord[]>;
  get(id: string): Promise<AnalysisRecord | null>;
  remove(id: string): Promise<boolean>;
}

export interface HealthInfo {
  ok: true;
  store: "memory" | "mongo";
  ai: "model" | "heuristic";
  model: string | null;
}
