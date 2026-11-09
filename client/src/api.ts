import axios from "axios";
import type { AnalysisRecord, HealthInfo } from "./types";

const client = axios.create({ baseURL: "/api" });

export async function fetchHealth(): Promise<HealthInfo> {
  const { data } = await client.get<HealthInfo>("/health");
  return data;
}

export async function fetchAnalyses(): Promise<AnalysisRecord[]> {
  const { data } = await client.get<{ analyses: AnalysisRecord[] }>("/analyses");
  return data.analyses;
}

export async function createAnalysis(body: { feedbackText: string; title?: string }): Promise<AnalysisRecord> {
  const { data } = await client.post<{ analysis: AnalysisRecord }>("/analyses", body);
  return data.analysis;
}

export async function deleteAnalysis(id: string): Promise<void> {
  await client.delete(`/analyses/${id}`);
}
