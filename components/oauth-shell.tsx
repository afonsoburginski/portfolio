// Dark liquid-glass card shared by the owner-only OAuth / LinkedIn pages (blue + teal accents only).
export function OAuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070d] p-6 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-[#1f6feb]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-[#2dd4bf]/20 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-1 text-xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-4 space-y-4 text-sm text-white/70">{children}</div>
      </section>
    </main>
  );
}
