import { listArticles } from "./articles";
import { getSocialPosts } from "./social-data";

export type FeedItem = {
  id: string;
  source: "article" | "linkedin";
  kind: "article" | "post" | "link";
  title: string | null;
  body: string;
  image: string | null;
  date: string;
  /** Primary destination: the article page on this site, or the LinkedIn post. */
  href: string;
  internal: boolean;
  /** Secondary link for articles that also live on LinkedIn. */
  linkedinUrl: string | null;
  readingMinutes: number | null;
};

const sameUrl = (a: string, b: string) => a.replace(/\/+$/, "").split("?")[0] === b.replace(/\/+$/, "").split("?")[0];

export async function getFeedItems(limit: number): Promise<FeedItem[]> {
  const [articles, posts] = await Promise.all([
    listArticles().catch(() => []),
    getSocialPosts(limit, "linkedin").catch(() => []),
  ]);
  const articleItems: FeedItem[] = articles.map((a) => ({
    id: `article:${a.slug}`, source: "article", kind: "article", title: a.title, body: a.description,
    image: a.coverImage, date: a.date, href: `/articles/${a.slug}`, internal: true,
    linkedinUrl: a.linkedinUrl, readingMinutes: a.readingMinutes,
  }));
  // A recorded LinkedIn post that points at one of our articles is the same item, not a second card.
  const linked = articles.map((a) => a.linkedinUrl).filter((u): u is string => !!u);
  const postItems: FeedItem[] = posts
    .filter((p) => !linked.some((u) => sameUrl(u, p.url)))
    .map((p) => ({
      id: `post:${p.id}`, source: "linkedin", kind: p.kind, title: p.title, body: p.body, image: p.image,
      date: p.published_at, href: p.url, internal: false, linkedinUrl: p.url, readingMinutes: null,
    }));
  return [...articleItems, ...postItems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
