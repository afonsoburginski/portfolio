import { desc, eq, or } from "drizzle-orm";
import { db } from "./db";
import { social_posts, type SocialPost } from "./schema";

export type SocialPostInput = Pick<SocialPost, "platform" | "kind" | "url" | "body" | "published_at"> &
  Partial<Pick<SocialPost, "urn" | "title" | "image">>;

export async function getSocialPosts(limit: number, platform?: SocialPost["platform"]) {
  return db.select().from(social_posts)
    .where(platform ? eq(social_posts.platform, platform) : undefined)
    .orderBy(desc(social_posts.published_at))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function upsertSocialPost(input: SocialPostInput) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: social_posts.id }).from(social_posts)
      .where(input.urn
        ? or(eq(social_posts.urn, input.urn), eq(social_posts.url, input.url))
        : eq(social_posts.url, input.url))
      .limit(1);
    if (existing) {
      const [row] = await tx.update(social_posts)
        .set({ ...input, updated_at: new Date().toISOString() })
        .where(eq(social_posts.id, existing.id)).returning();
      return row;
    }
    const [row] = await tx.insert(social_posts).values(input).returning();
    return row;
  });
}

export async function deleteSocialPost(selector: { id?: string; urn?: string; url?: string }) {
  const where = selector.id ? eq(social_posts.id, selector.id)
    : selector.urn ? eq(social_posts.urn, selector.urn)
      : selector.url ? eq(social_posts.url, selector.url) : undefined;
  if (!where) throw new Error("A post identifier is required.");
  const [row] = await db.delete(social_posts).where(where).returning({ id: social_posts.id });
  return row ?? null;
}
