"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { SiLinkedin } from "react-icons/si";
import type { SocialPost } from "@/lib/schema";

export function SocialFeed({ posts }: { posts: SocialPost[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="w-full mt-12 text-left">
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2dd4bf]">Latest from LinkedIn</p>
        <h2 className="mt-2 font-satoshi text-3xl text-white md:text-4xl">Socials</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-sm text-white/55">
              <SiLinkedin className="text-[#1f6feb]" aria-hidden="true" />
              <span>LinkedIn</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published_at} title={new Date(post.published_at).toLocaleDateString("en-US")}>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</time>
            </div>
            {post.title && <h3 className="mt-4 font-satoshi text-lg text-white">{post.title}</h3>}
            <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-white/75">{post.body}</p>
            {post.image && (
              <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-white/10">
                <Image src={post.image} alt={post.title || "LinkedIn post image"} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" unoptimized />
              </div>
            )}
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="mt-5 self-start text-sm font-medium text-[#2dd4bf] transition-colors hover:text-white">
              Read on LinkedIn ↗
            </a>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
