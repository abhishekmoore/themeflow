import mongoose, { Schema } from "mongoose";
import type { AnalysisRecord, AnalysisStore, NewAnalysis, ThemeResult } from "../types.js";

interface AnalysisDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  feedbackText: string;
  result: ThemeResult;
  createdAt: Date;
}

const analysisSchema = new Schema<AnalysisDoc>(
  {
    title: { type: String, default: "" },
    feedbackText: { type: String, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
);

const AnalysisModel = mongoose.models.Analysis ?? mongoose.model<AnalysisDoc>("Analysis", analysisSchema);

function toRecord(doc: AnalysisDoc): AnalysisRecord {
  return {
    id: doc._id.toString(),
    title: doc.title,
    feedbackText: doc.feedbackText,
    result: doc.result,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createMongoStore(uri: string): Promise<AnalysisStore> {
  await mongoose.connect(uri);
  return {
    async insert(analysis: NewAnalysis): Promise<AnalysisRecord> {
      const doc = await AnalysisModel.create(analysis);
      return toRecord(doc);
    },
    async list(limit: number): Promise<AnalysisRecord[]> {
      const docs = await AnalysisModel.find().sort({ createdAt: -1 }).limit(limit).exec();
      return docs.map((doc) => toRecord(doc));
    },
    async get(id: string): Promise<AnalysisRecord | null> {
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await AnalysisModel.findById(id).exec();
      return doc ? toRecord(doc) : null;
    },
    async remove(id: string): Promise<boolean> {
      if (!mongoose.isValidObjectId(id)) return false;
      const result = await AnalysisModel.findByIdAndDelete(id).exec();
      return result !== null;
    },
  };
}
