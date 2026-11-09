import { randomUUID } from "node:crypto";
import type { AnalysisRecord, AnalysisStore, NewAnalysis } from "../types.js";

export function createMemoryStore(): AnalysisStore {
  const rows: AnalysisRecord[] = [];

  return {
    async insert(analysis: NewAnalysis): Promise<AnalysisRecord> {
      const record: AnalysisRecord = {
        id: randomUUID(),
        ...analysis,
        createdAt: new Date().toISOString(),
      };
      rows.unshift(record);
      return record;
    },
    async list(limit: number): Promise<AnalysisRecord[]> {
      return rows.slice(0, limit);
    },
    async get(id: string): Promise<AnalysisRecord | null> {
      return rows.find((row) => row.id === id) ?? null;
    },
    async remove(id: string): Promise<boolean> {
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) return false;
      rows.splice(index, 1);
      return true;
    },
  };
}
