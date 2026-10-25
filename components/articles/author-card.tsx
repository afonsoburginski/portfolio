import Image from "next/image";
import Link from "next/link";
import { CalButton } from "./cal-button";

const btn = "inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition-colors";

export function AuthorCard({ canonicalUrl }: { canonicalUrl: string }) {
  const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;
  return (
    <aside className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm font-sans">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">Written by</p>
      <div className="mt-4 flex items-start gap-4">
        <Image src="/avatar.png" alt="Afonso Burginski" width={56} height={56} className="size-14 rounded-full border border-white/10 object-cover" />
        <div>
          <p className="font-medium text-white">Afonso Burginski</p>
          <p className="mt-1 text-[15px] leading-6 text-white/60">
            Senior Software Engineer specializing in video streaming, real-time media, and distributed systems.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/#projects" className={`${btn} bg-white/10 text-white hover:bg-white/15`}>View case studies</Link>
        <CalButton className={`${btn} bg-[#1f6feb] text-white hover:bg-[#388bfd]`}>Get in touch</CalButton>
        <a href={share} target="_blank" rel="noopener noreferrer" className={`${btn} text-white/70 hover:bg-white/5 hover:text-white`}>
          Share on LinkedIn
        </a>
      </div>
    </aside>
  );
}
