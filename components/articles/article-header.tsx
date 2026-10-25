import Image from "next/image";
import Link from "next/link";

const TOPICS = ["Video streaming", "HLS", "WebRTC", "Distributed systems"];

export function ArticleHeader({ title, description, date, readingMinutes }: { title: string; description: string; date: string; readingMinutes: number }) {
  return (
    <header className="mx-auto max-w-[1040px]">
      <Link href="/" className="text-sm text-white/50 transition-colors hover:text-white">← afonsodev.com</Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-[#2dd4bf]">Engineering notes</p>
      <h1 className="mt-4 max-w-4xl text-[36px] font-normal leading-[1.08] tracking-[-0.02em] text-white font-satoshi md:text-[56px]">{title}</h1>
      <p className="mt-5 max-w-3xl font-sans text-lg leading-8 text-white/60">{description}</p>
      <div className="mt-8 flex items-center gap-3 font-sans">
        <Image src="/avatar.png" alt="Afonso Burginski" width={44} height={44} className="size-11 rounded-full border border-white/10 object-cover" />
        <div className="text-sm leading-5">
          <p className="font-medium text-white">Afonso Burginski</p>
          <p className="text-white/50">Senior Software Engineer · {date} · {readingMinutes} min read</p>
        </div>
      </div>
      <ul className="mt-6 flex flex-wrap gap-2 font-sans">
        {TOPICS.map((t) => (
          <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur-sm">{t}</li>
        ))}
      </ul>
    </header>
  );
}
