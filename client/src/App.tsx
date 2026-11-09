import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState, type FormEvent } from "react";
import { createAnalysis, deleteAnalysis, fetchAnalyses, fetchHealth } from "./api";

const analysesKey = ["analyses"];

export function App() {
  const queryClient = useQueryClient();
  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth });
  const analyses = useQuery({ queryKey: analysesKey, queryFn: fetchAnalyses });

  const create = useMutation({
    mutationFn: createAnalysis,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: analysesKey });
    },
  });

  const remove = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: analysesKey });
    },
  });

  const [feedbackText, setFeedbackText] = useState("");
  const [title, setTitle] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = analyses.data?.find((a) => a.id === selectedId) ?? analyses.data?.[0] ?? null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (feedbackText.trim().length < 40) return;
    create.mutate(
      { feedbackText: feedbackText.trim(), title: title.trim() || undefined },
      {
        onSuccess: (record) => {
          setSelectedId(record.id);
          setFeedbackText("");
          setTitle("");
        },
      },
    );
  }

  const aiLabel =
    health.data?.ai === "model" && health.data.model
      ? `model: ${health.data.model}`
      : "offline clustering";

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">ThemeFlow</h1>
            <p className="text-sm text-stone-500">Cluster feedback into themes with supporting quotes and one action each.</p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {health.isPending ? "checking…" : aiLabel}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[1fr_280px]">
        <section>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-stone-700">
                Optional title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 support feedback"
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
              />
            </div>
            <div>
              <label htmlFor="feedback" className="mb-1 block text-sm font-medium text-stone-700">
                Feedback lines
              </label>
              <textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={10}
                placeholder="Paste several feedback lines, one per line or as a block. Minimum 40 characters."
                className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
                required
              />
              <p className="mt-1 text-xs text-stone-500">{feedbackText.trim().length} characters</p>
            </div>
            <button
              type="submit"
              disabled={create.isPending || feedbackText.trim().length < 40}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {create.isPending ? "Clustering…" : "Cluster themes"}
            </button>
            {create.isError && (
              <p className="text-sm text-red-600">
                {create.error instanceof Error ? create.error.message : "Could not create analysis."}
              </p>
            )}
          </form>

          {selected && (
            <article className="mt-8 rounded-lg border border-stone-200 bg-white p-6">
              <header className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.title || "Untitled analysis"}</h2>
                  <p className="text-sm text-stone-500">
                    {formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true })} ·{" "}
                    {selected.result.source === "model" ? `model${selected.result.model ? ` (${selected.result.model})` : ""}` : "offline clustering"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(selected.id)}
                  disabled={remove.isPending}
                  className="text-sm text-stone-500 hover:text-red-600"
                >
                  Delete
                </button>
              </header>
              <div className="space-y-6">
                {selected.result.themes.map((theme, i) => (
                  <div key={i} className="border-t border-stone-100 pt-4 first:border-t-0 first:pt-0">
                    <h3 className="font-medium">{theme.name}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-stone-600">
                      {theme.quotes.map((q, qi) => (
                        <li key={qi} className="pl-3 before:mr-2 before:content-['“'] after:content-['”']">
                          {q}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm">
                      <span className="font-medium text-stone-800">Action: </span>
                      {theme.action}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>

        <aside>
          <h2 className="mb-3 text-sm font-medium text-stone-700">Saved analyses</h2>
          {analyses.isPending && <p className="text-sm text-stone-500">Loading…</p>}
          {analyses.isError && <p className="text-sm text-red-600">Could not load list.</p>}
          <ul className="space-y-2">
            {analyses.data?.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selected?.id === a.id ? "border-stone-400 bg-stone-100" : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="font-medium">{a.title || "Untitled"}</div>
                  <div className="text-xs text-stone-500">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {analyses.data?.length === 0 && <p className="text-sm text-stone-500">None yet.</p>}
        </aside>
      </main>
    </div>
  );
}
