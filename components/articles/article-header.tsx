import Image from "next/image";
import Link from "next/link";

const DEFAULT_TOPICS = ["Video streaming", "HLS", "WebRTC", "Distributed systems"];

type Props = { title: string; subtitle: string; date: string; readingMinutes: number; tags?: string[] };

export function ArticleHeader({ title, subtitle, date, readingMinutes, tags }: Props) {
  const topics = tags?.length ? tags : DEFAULT_TOPICS;
  return (
    <header className="max-w-[820px]">
      <Link href="/" className="text-sm text-white/50 transition-colors hover:text-white">← afonsodev.com</Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#2dd4bf]">Engineering notes</p>
      <h1 className="mt-3 text-[34px] font-normal leading-[1.12] tracking-[-0.02em] text-white font-satoshi md:text-[46px]">{title}</h1>
      <p className="mt-5 font-sans text-lg leading-8 text-white/60">{subtitle}</p>
      <div className="mt-7 flex items-center gap-3 font-sans">
        <Image src="/avatar.png" alt="Afonso Burginski" width={44} height={44} className="size-11 rounded-full border border-white/10 object-cover" />
        <div className="text-sm leading-5">
          <p className="font-medium text-white">Afonso Burginski</p>
          <p className="text-white/50">Senior Software Engineer · {date} · {readingMinutes} min read</p>
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2 font-sans">
        {topics.map((t) => (
          <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur-sm">{t}</li>
        ))}
      </ul>
    </header>
  );
}
