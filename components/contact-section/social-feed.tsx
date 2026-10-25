"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { SiLinkedin } from "react-icons/si";
import Link from "next/link";
import type { FeedItem } from "@/lib/feed";

export function SocialFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full mt-12 text-left">
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2dd4bf]">Writing and posts</p>
        <h2 className="mt-2 font-satoshi text-3xl text-white md:text-4xl">Socials</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-sm text-white/55">
              {post.source === "article" ? <span className="rounded-full border border-[#2dd4bf]/40 px-2 py-0.5 text-xs text-[#2dd4bf]">Article</span> : <><SiLinkedin className="text-[#1f6feb]" aria-hidden="true" /><span>LinkedIn</span></>}
              <span aria-hidden="true">·</span>
              <time dateTime={post.date} title={new Date(post.date).toLocaleDateString("en-US")}>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</time>
              {post.readingMinutes ? <span className="ml-auto text-xs">{post.readingMinutes} min read</span> : null}
            </div>
            {post.title && <h3 className="mt-4 font-satoshi text-lg text-white">{post.internal ? <Link href={post.href} className="hover:text-[#2dd4bf]">{post.title}</Link> : post.title}</h3>}
            <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-white/75">{post.body}</p>
            {post.image && (
              <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-white/10">
                <Image src={post.image} alt={post.title || "Post image"} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" unoptimized />
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
              {post.internal ? (
                <Link href={post.href} className="text-[#2dd4bf] transition-colors hover:text-white">Read on this site →</Link>
              ) : null}
              {post.linkedinUrl ? (
                <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer" className={post.internal ? "text-white/60 transition-colors hover:text-white" : "text-[#2dd4bf] transition-colors hover:text-white"}>
                  {post.kind === "article" || post.internal ? "Also on LinkedIn ↗" : "Read on LinkedIn ↗"}
                </a>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
