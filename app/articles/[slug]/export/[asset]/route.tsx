import { ImageResponse } from "next/og";
import { extractTables } from "@/lib/article-linkedin";
import { getArticle } from "@/lib/articles";
import { hasMcpBearer } from "@/lib/mcp-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1920;
const PAD = 64;
const FONT = 26;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0d1117", color: "#e6edf3" }}>
      <div style={{ display: "flex", height: 14, width: "100%", background: "linear-gradient(90deg, #1f6feb, #2dd4bf)" }} />
      {children}
    </div>
  );
}

function cover(title: string) {
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "100px 128px 88px" }}>
          <div style={{ display: "flex", fontSize: 40, letterSpacing: 6, color: "#2dd4bf", fontWeight: 700 }}>VIDEO STREAMING · DISTRIBUTED SYSTEMS</div>
          <div style={{ display: "flex", flex: 1, alignItems: "center", fontSize: title.length > 60 ? 100 : 116, lineHeight: 1.1, fontWeight: 700, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 44, color: "#8b949e" }}>Afonso Burginski · Senior Software Engineer · afonsodev.com</div>
        </div>
      </Frame>
    ),
    { width: 1920, height: 1080 },
  );
}

function table(rows: string[][]) {
  const cols = rows[0].length;
  const colWidth = (WIDTH - PAD * 2) / cols;
  const charsPerLine = Math.max(8, Math.floor((colWidth - 48) / (FONT * 0.55)));
  const rowHeights = rows.map((row, i) => {
    const lines = Math.max(...row.map((cell) => Math.ceil(cell.length / charsPerLine)));
    return 32 + lines * FONT * 1.4 + (i === 0 ? 4 : 0);
  });
  const height = Math.ceil(14 + PAD * 2 + rowHeights.reduce((a, b) => a + b, 0));
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", margin: PAD, border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, overflow: "hidden" }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: "flex", background: i === 0 ? "#161b22" : i % 2 === 0 ? "rgba(255,255,255,.03)" : "transparent", borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              {row.map((cell, j) => (
                <div key={j} style={{ display: "flex", width: colWidth, padding: "16px 24px", fontSize: FONT, lineHeight: 1.4, fontWeight: i === 0 || j === cols - 1 ? 700 : 400, color: i === 0 ? "#58a6ff" : j === cols - 1 ? "#2dd4bf" : "#c9d1d9" }}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Frame>
    ),
    { width: WIDTH, height },
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string; asset: string }> }) {
  if (!hasMcpBearer(request)) return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  const { slug, asset } = await params;
  const article = await getArticle(slug, { preview: true });
  if (!article) return new Response("Not Found", { status: 404 });

  const name = asset.replace(/\.png$/, "");
  if (name === "capa") return cover(article.title);
  const match = name.match(/^table-(\d+)$/);
  const rows = match ? extractTables(article.body)[Number(match[1]) - 1] : undefined;
  if (rows?.length && rows[0].length) return table(rows);
  return new Response("Not Found", { status: 404 });
}
