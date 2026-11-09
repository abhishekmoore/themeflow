import OpenAI from "openai";
import { heuristicCluster } from "./heuristic.js";
import { extractJson } from "./parse.js";
import { modelResultSchema } from "./schema.js";
import type { ThemeResult } from "../types.js";

const SYSTEM = `You cluster customer feedback into themes.
Return JSON only with key: themes (array of 3 to 6 items).
Each item: name (short theme title), quotes (array of exact short excerpts from the feedback), action (one concrete product action).
Rules:
- Every quote must be copied from the feedback text. Do not invent quotes, customers, metrics, or features.
- Do not invent facts that are not supported by the paste.
- Prefer 3–6 themes. Merge weak ones.
- The action must be something a product team could do, grounded in the quotes.
- Do not mention that you are a model.`;

export async function clusterFeedback(input: {
  feedbackText: string;
  apiKey: string;
  baseURL: string;
  model: string;
}): Promise<ThemeResult> {
  if (!input.apiKey) {
    return heuristicCluster(input.feedbackText);
  }
  try {
    return await fromModel(input);
  } catch (error) {
    const fallback = heuristicCluster(input.feedbackText);
    const message = error instanceof Error ? error.message : "model request failed";
    if (fallback.themes[0]) {
      fallback.themes[0].action = `Model request failed (${clip(message)}). Showing offline clustering. ${fallback.themes[0].action}`;
    }
    return fallback;
  }
}

async function fromModel(input: {
  feedbackText: string;
  apiKey: string;
  baseURL: string;
  model: string;
}): Promise<ThemeResult> {
  const client = new OpenAI({
    apiKey: input.apiKey,
    baseURL: input.baseURL || undefined,
  });
  const user = `FEEDBACK:\n${input.feedbackText}`;
  let raw = await complete(client, input.model, user, true);
  let parsed = readModel(raw);
  if (!parsed.ok) {
    raw = await complete(
      client,
      input.model,
      `${user}\n\nThe previous reply was invalid (${parsed.reason}). Reply with one JSON object only.`,
      false,
    );
    parsed = readModel(raw);
  }
  if (!parsed.ok) {
    throw new Error(parsed.reason);
  }
  return {
    themes: parsed.value.themes,
    source: "model",
    model: input.model,
  };
}

function readModel(raw: string): { ok: true; value: ReturnType<typeof modelResultSchema.parse> } | { ok: false; reason: string } {
  try {
    const json = extractJson(raw);
    const value = modelResultSchema.parse(json);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? clip(error.message) : "invalid model JSON" };
  }
}

async function complete(client: OpenAI, model: string, user: string, jsonMode: boolean): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    });
    return response.choices[0]?.message?.content ?? "";
  } catch (error) {
    if (!jsonMode) throw error;
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    });
    return response.choices[0]?.message?.content ?? "";
  }
}

function clip(message: string): string {
  return message.replace(/\s+/g, " ").slice(0, 180);
}
