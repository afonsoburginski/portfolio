import { z } from "zod";

/**
 * Read-only job discovery. Both providers expose public APIs; no private site
 * endpoints, user sessions, scraping or application submissions are used.
 */
export const jobProviders = [
  { id: "jobicy", name: "Jobicy", search: true, apply: false, attribution: "https://jobicy.com" },
  { id: "remotive", name: "Remotive", search: true, apply: false, attribution: "https://remotive.com" },
  { id: "linkedin", name: "LinkedIn", search: false, apply: false, status: "not-integrated" },
  { id: "indeed", name: "Indeed", search: false, apply: false, status: "not-integrated" },
] as const;

export type CareerJob = {
  id: string;
  provider: "jobicy" | "remotive";
  title: string;
  company: string;
  location: string;
  description: string;
  sourceUrl: string;
  publishedAt: string | null;
  salary: string | null;
  remote: true;
};

export type JobSearchResult = {
  query: string;
  jobs: CareerJob[];
  providers: { id: string; ok: boolean; error?: string }[];
  count: number;
};

const jobicyJob = z.object({
  id: z.union([z.number(), z.string()]),
  url: z.string().url(),
  jobTitle: z.string().min(1),
  companyName: z.string().min(1),
  jobGeo: z.string().optional().nullable(),
  jobExcerpt: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  pubDate: z.string().optional().nullable(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  salaryCurrency: z.string().optional().nullable(),
});

const remotiveJob = z.object({
  id: z.union([z.number(), z.string()]),
  url: z.string().url(),
  title: z.string().min(1),
  company_name: z.string().min(1),
  candidate_required_location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  publication_date: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
});

function sourceUrl(raw: string, host: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== host || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

// Never return raw HTML to a caller that might render it as trusted markup.
function plainText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12_000);
}

async function readApi(url: URL, revalidate: number): Promise<unknown> {
  const response = await fetch(url.href, {
    headers: { Accept: "application/json" },
    next: { revalidate },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
  return response.json();
}

async function searchJobicy(query: string): Promise<CareerJob[]> {
  const url = new URL("https://jobicy.com/api/jobs");
  url.searchParams.set("count", "100");
  // Jobicy's tag filter matches role titles, not full job descriptions.
  const keyword = query.split(/\s+/).find(term => term.length > 3 && !/^(senior|staff|remote)$/i.test(term));
  if (keyword) url.searchParams.set("tag", keyword);
  const json = await readApi(url, 900);
  if (!json || typeof json !== "object" || !("jobs" in json) || !Array.isArray(json.jobs)) {
    throw new Error("Malformed Jobicy response");
  }
  const jobs: CareerJob[] = [];
  for (const raw of json.jobs) {
    const parsed = jobicyJob.safeParse(raw);
    if (!parsed.success) continue;
    const item = parsed.data;
    const link = sourceUrl(item.url, "jobicy.com");
    if (!link) continue;
    const salary = item.salaryMin != null || item.salaryMax != null
      ? `${item.salaryCurrency ?? "USD"} ${item.salaryMin ?? "?"}–${item.salaryMax ?? "?"}`
      : null;
    jobs.push({
      id: `jobicy:${item.id}`, provider: "jobicy", title: item.jobTitle, company: item.companyName,
      location: item.jobGeo || "Remote", description: plainText(item.jobDescription || item.jobExcerpt),
      sourceUrl: link, publishedAt: item.pubDate || null, salary, remote: true,
    });
  }
  return jobs;
}

async function searchRemotive(query: string): Promise<CareerJob[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  url.searchParams.set("search", query);
  url.searchParams.set("limit", "100");
  // Remotive recommends at most 4 syncs/day. Shared Next cache is 6 hours.
  const json = await readApi(url, 21_600);
  if (!json || typeof json !== "object" || !("jobs" in json) || !Array.isArray(json.jobs)) {
    throw new Error("Malformed Remotive response");
  }
  const jobs: CareerJob[] = [];
  for (const raw of json.jobs) {
    const parsed = remotiveJob.safeParse(raw);
    if (!parsed.success) continue;
    const item = parsed.data;
    const link = sourceUrl(item.url, "remotive.com");
    if (!link) continue;
    jobs.push({
      id: `remotive:${item.id}`, provider: "remotive", title: item.title,
      company: item.company_name, location: item.candidate_required_location || "Remote",
      description: plainText(item.description), sourceUrl: link,
      publishedAt: item.publication_date || null, salary: item.salary || null, remote: true,
    });
  }
  return jobs;
}

function canonical(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export async function searchCareerJobs(query: string, limit = 30): Promise<JobSearchResult> {
  const normalized = query.trim().slice(0, 100);
  if (!normalized) throw new Error("A job search query is required.");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("limit must be 1–100.");
  const results = await Promise.allSettled([searchJobicy(normalized), searchRemotive(normalized)]);
  const ids = ["jobicy", "remotive"];
  const providers = results.map((result, index) => ({
    id: ids[index], ok: result.status === "fulfilled",
    ...(result.status === "rejected" ? { error: "Provider temporarily unavailable" } : {}),
  }));
  const seen = new Set<string>();
  const merged: CareerJob[] = [];
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const job of result.value) {
      const key = `${canonical(job.company)}|${canonical(job.title)}|${canonical(job.location)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(job);
    }
  }
  const terms = canonical(normalized).split(" ").filter(Boolean);
  const relevance = (job: CareerJob) => {
    const title = canonical(job.title);
    return terms.reduce((score, term) => score + (title.includes(term) ? 2 : 0), 0);
  };
  merged.sort((a, b) => relevance(b) - relevance(a) || (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0));
  return { query: normalized, jobs: merged.slice(0, limit), providers, count: merged.length };
}
