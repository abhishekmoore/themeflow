import type { Theme, ThemeResult } from "../types.js";

const ACTIONS = [
  "Review the quotes and decide if a product change is warranted.",
  "Check whether this appears in support tickets as well.",
  "Ask a designer to look at the affected screen.",
  "Add a metric so the team can see if the issue grows.",
  "Prioritize with the product owner against the current roadmap.",
  "Confirm with one more customer before building anything.",
];

export function heuristicCluster(feedback: string): ThemeResult {
  const lines = feedback
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 8)
    .slice(0, 24);

  if (lines.length === 0) {
    return {
      themes: [
        {
          name: "Insufficient feedback",
          quotes: [feedback.slice(0, 200) || "No usable lines."],
          action: "Collect more feedback before clustering.",
        },
        {
          name: "Need more detail",
          quotes: ["The paste did not contain clear feedback lines."],
          action: "Ask the reporter for specific examples.",
        },
        {
          name: "Offline placeholder",
          quotes: ["No model was used."],
          action: "Set OPENAI_API_KEY for real clustering.",
        },
      ],
      source: "heuristic",
    };
  }

  const groups = bucket(lines, Math.min(6, Math.max(3, Math.ceil(lines.length / 3))));
  const themes: Theme[] = groups.map((quotes, index) => ({
    name: guessName(quotes, index),
    quotes: quotes.slice(0, 5),
    action: ACTIONS[index % ACTIONS.length] ?? ACTIONS[0]!,
  }));

  while (themes.length < 3) {
    themes.push({
      name: `Additional theme ${themes.length + 1}`,
      quotes: [lines[0] ?? "See original feedback."],
      action: ACTIONS[themes.length % ACTIONS.length] ?? ACTIONS[0]!,
    });
  }

  return { themes: themes.slice(0, 6), source: "heuristic" };
}

function bucket(items: string[], count: number): string[][] {
  const buckets: string[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => {
    buckets[i % count]!.push(item);
  });
  return buckets.filter((b) => b.length > 0);
}

function guessName(quotes: string[], index: number): string {
  const text = quotes.join(" ").toLowerCase();
  if (/\b(slow|lag|performance|speed)\b/.test(text)) return "Performance";
  if (/\b(bug|error|crash|broken)\b/.test(text)) return "Bugs";
  if (/\b(ui|button|screen|design|confus)\b/.test(text)) return "Usability";
  if (/\b(price|cost|billing|pay)\b/.test(text)) return "Pricing";
  if (/\b(doc|help|support|how)\b/.test(text)) return "Documentation";
  return `Theme ${index + 1}`;
}
