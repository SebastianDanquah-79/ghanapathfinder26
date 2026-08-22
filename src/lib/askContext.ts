/**
 * Builds the compact "guide results" context that the Ask assistant answers
 * from. Keeps only what a model needs: title, what it is, and where it lives.
 */
export interface AskContextItem {
  kind: string;
  title: string;
  subtitle?: string | null;
  blurb?: string | null;
  to?: string | null;
}

const clean = (v: string | null | undefined, max = 220) =>
  (v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export const buildAskContext = (
  query: string,
  items: AskContextItem[],
  limit = 24,
): string => {
  const lines = items.slice(0, limit).map((i) => {
    const bits = [
      `- [${i.kind}] ${clean(i.title, 120)}`,
      i.subtitle ? `(${clean(i.subtitle, 120)})` : "",
      i.to ? `→ ${i.to}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const blurb = clean(i.blurb);
    return blurb ? `${bits}\n  ${blurb}` : bits;
  });

  if (!lines.length) {
    return query ? `The student searched for "${query}" and no results matched.` : "";
  }

  return [
    query ? `Current search: "${query}"` : "Current search: (none)",
    `Top ${lines.length} results shown to the student:`,
    ...lines,
  ].join("\n");
};
