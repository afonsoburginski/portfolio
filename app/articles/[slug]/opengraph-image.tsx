import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";

export const runtime = "nodejs";
export const alt = "Article by Afonso Burginski";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const title = article?.title ?? "Afonso Burginski";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0d1117", color: "#e6edf3" }}>
        <div style={{ display: "flex", height: 10, width: "100%", background: "linear-gradient(90deg, #1f6feb, #2dd4bf)" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "64px 80px 56px" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#2dd4bf", fontWeight: 700 }}>
            VIDEO STREAMING · DISTRIBUTED SYSTEMS
          </div>
          <div style={{ display: "flex", flex: 1, alignItems: "center", fontSize: title.length > 60 ? 62 : 72, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#8b949e" }}>
            Afonso Burginski · Senior Software Engineer · afonsodev.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
