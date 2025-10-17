import { CaseStudy } from "./types";

export const nextjsFfmpegTranscoder: CaseStudy = {
  title: "FFmpeg Video Transcoder – Open Source HLS Pipeline",
  description:
    "Open‑source, production‑grade video ingestion and HLS transcoding system. Unlimited uploads via Go server, local FFmpeg processing, Cloudflare R2 storage, and a modern Next.js admin dashboard. Extracted from Stormzplus and released ready‑to‑use for real projects.",
  image: "/projects/nextjs-ffmpeg-transcoder-2.png",
  role: "Creator & Maintainer",
  timeline: "2024–2025",
  stack:
    "Next.js 15 (App Router), React 19, TypeScript, Go 1.22+, FFmpeg/FFprobe + NVIDIA NVENC (CUDA), Cloudflare R2 (S3), Zustand, TanStack React Query, Radix UI, TailwindCSS 4, Lucide Icons, Sonner",
  githubUrl: "https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder",
  story:
    "While building Stormzplus, I hit the Node.js ~2GB upload limit and wrote a Go upload server + FFmpeg HLS encoder. After proving the pipeline in production, I open‑sourced it as a ready‑to‑use toolkit so teams can ship video platforms without wrestling with file‑size limits or complex media plumbing.",
  objectives: [
    "Eliminate the Node.js 2GB file upload limitation using a dedicated Go server with streaming I/O.",
    "Provide a complete, working FFmpeg pipeline for HLS generation with multiple bitrates and audio tracks.",
    "Use NVIDIA NVENC hardware acceleration to dramatically speed up encoding while reducing CPU load.",
    "Demonstrate modern patterns: Zustand for upload queue, React Query for data, Radix UI for accessibility.",
    "Publish to Cloudflare R2 with CDN‑ready URLs and far‑future caching semantics.",
    "Ship as an educational open‑source project with clear docs, setup scripts, and contributing guidelines.",
  ],
  challenges: [
    {
      title: "Breaking the 2GB barrier with Go",
      detail:
        "Node.js has a V8 heap constraint that caps file uploads at ~2GB. I built a standalone Go HTTP server that uses streaming I/O with a 64KB buffer, real‑time progress updates every 500ms, and constant memory usage regardless of file size. The server exposes /upload, /progress, and /health endpoints with full CORS support for seamless integration with Next.js.",
    },
    {
      title: "Production‑ready FFmpeg HLS pipeline",
      detail:
        "The encoder runs FFmpeg locally to generate HLS (master playlist + variant streams). I orchestrate multi‑bitrate video (H.264), separate audio tracks, and thumbnails in a single pass. Each job creates a UUID that names both the temp directory and the R2 folder, ensuring deterministic paths and idempotent uploads.",
    },
    {
      title: "GPU prerequisites & NVENC availability",
      detail:
        "Ensure NVIDIA drivers + CUDA/NVENC stack are available and that FFmpeg is built with nvcodec. The pipeline auto-detects GPU and prefers `h264_nvenc`/`hevc_nvenc` when present, falling back to CPU if unavailable.",
    },
    {
      title: "Real‑time upload queue with Zustand",
      detail:
        "I designed an upload store that manages job lifecycle: queued → uploading → encoding → publishing → ready. The store polls the Go server every second for progress, updates the UI with upload speed/MB, and triggers Next.js API routes for post‑upload processing. All state is centralized, making it trivial to add features like pause/resume.",
    },
    {
      title: "Developer experience and Windows support",
      detail:
        "I included build.bat for Windows users (who often struggle with Go builds), a detailed SETUP.md with troubleshooting, and a CONTRIBUTING.md that explains architectural decisions. The goal was to make it easy for anyone to clone, run, and understand the full stack in under 10 minutes.",
    },
  ],
  highlights: [
    "Unlimited file uploads via Go server with streaming I/O—tested with 10GB+ files.",
    "Complete FFmpeg HLS pipeline: multi‑bitrate video, audio tracks, thumbnails, and master playlists.",
    "GPU‑accelerated encoding using NVIDIA NVENC (`h264_nvenc`/`hevc_nvenc`) with configurable presets and AQ/lookahead.",
    "Cloudflare R2 integration with S3‑compatible API and CDN‑ready public URLs.",
    "Real‑time progress tracking: upload speed, MB transferred, encoding status, and publishing stage.",
    "Modern UI: collections grid, media table with context menus, chapters editor, and job status indicators.",
    "Cross‑platform: Windows batch scripts, Linux/Mac shell support, and Bun/npm compatibility.",
    "Open‑source (MIT): clean code, documented decisions, and contribution‑friendly structure.",
  ],
  outcomes: [
    "Open‑sourced on GitHub with comprehensive README and setup guide.",
    "Proven in production: powers the Stormzplus streaming platform.",
    "Educational resource for developers building video platforms.",
    "Zero file size limitations: handles files of any size with constant memory usage.",
  ],
  revenueNote:
    "This is a free, open‑source project (MIT license) built to help the developer community. The architecture is battle‑tested in production and designed to scale from hobby projects to commercial platforms.",
  sections: [
    {
      title: "The Product",
      body: [
        "Everything starts with collections—containers for related videos that keep your library organized. The dashboard shows quick action cards (Upload, Manage, Stream) and a grid of existing collections with stats: video count and total size.",
        "Click into any collection to see the media table: every video's status (queued/uploading/encoding/ready), duration, file size, view count. Progress bars update in real time during ingest and encode. Click 'Add more videos' to keep expanding your catalog without leaving the page.",
        "Clicking a video opens the full dialog: an HLS player with quality selector, video metadata (title, duration, size, views), copyable HLS/CDN URLs, thumbnail upload, and quick actions (download, delete, manage subtitles). Everything you need in one place.",
      ],
      image: "/projects/nextjs-ffmpeg-transcoder-1.png",
    },
    {
      title: "How It Works",
      body: [
        "The stack is deliberately simple: Next.js 15 (App Router) handles admin UI and API orchestration. A Go HTTP server runs on port 8081 for unlimited uploads with streaming I/O. FFmpeg/FFprobe process videos locally. Cloudflare R2 stores the final HLS with CDN edge caching. Zustand manages upload queue state; React Query handles collections/videos data.",
        "Drop a file → the UI creates a job (UUID) and sends it to the Go server via multipart POST. The server streams to temp with a 64KB buffer, reporting progress every 500ms. Once complete, it returns the temp path and triggers the Next.js encode route.",
        "FFmpeg runs locally: with NVENC (h264_nvenc/hevc_nvenc) if a compatible NVIDIA GPU is detected, otherwise falls back to libx264. It generates HLS (master playlist + multi-bitrate variants), audio tracks, and thumbnails—all keyed by UUID.",
        "Assets upload to Cloudflare R2 in parallel with cache headers tuned for edge hits. The final HLS URL uses NEXT_PUBLIC_CDN_BASE_URL. Temp files clean up automatically; the store updates the job to 'ready' and the UI reflects it instantly.",
      ],
      image: "/projects/nextjs-ffmpeg-transcoder-2.png",
    },
    {
      title: "GPU Acceleration",
      body: [
        "Node.js caps uploads at ~2GB due to V8 heap limits. Go's streaming I/O uses constant memory (~64KB buffer) regardless of file size—tested with 10GB+ files. The server is stateless: progress lives in-memory and GCs when jobs finish. Deployment is a single binary (Windows: stormz-upload-server.exe).",
        "NVENC offloads encoding to the GPU, dramatically reducing CPU load and encode time. When a compatible NVIDIA GPU is present, the encoder automatically switches to h264_nvenc or hevc_nvenc. If unavailable, it falls back to libx264—same output, just slower.",
        "Recommended VOD flags for quality/performance balance: -preset p4 (or slow), -rc vbr_hq, -rc-lookahead 20 (analyzes future frames for better bitrate allocation), -spatial-aq 1 -aq-strength 8 (adaptive quantization for motion), -temporal-aq 1 (improves dark scenes).",
        "Example command: ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -rc vbr_hq -b:v 3000k -maxrate 3210k -bufsize 4500k -rc-lookahead 20 -spatial-aq 1 -aq-strength 8 -hls_time 4 -hls_playlist_type vod -hls_segment_filename out_%03d.ts index.m3u8",
        "This design keeps the system flexible: run it on a gaming rig with RTX GPU or a cloud VM with CPU-only—no code changes needed.",
      ],
      image: "/projects/nextjs-ffmpeg-transcoder-3.png",
    },
    {
      title: "Why It Matters",
      body: [
        "Eliminates the Node.js upload ceiling: handle files of any size without memory blowups or crashes. Streaming I/O is critical—buffering entire files into memory doesn't scale.",
        "Provides a complete, working HLS pipeline with GPU acceleration and CDN-ready outputs—no guesswork on FFmpeg flags or R2 setup. UUIDs for job/folder names ensure deterministic paths and prevent race conditions.",
        "Demonstrates production-ready patterns: Zustand for job queues, React Query for server state, idempotent jobs, and real-time progress without WebSocket overhead. Polling is simple and reliable; WebSockets add complexity without clear benefits for this use case.",
        "Clear separation of concerns: Go handles upload, Next.js orchestrates pipeline, FFmpeg processes media. This modularity makes debugging trivial and enables independent scaling of each piece.",
        "Ships ready to clone and run: detailed README, SETUP.md with troubleshooting, build.bat for Windows users, and CONTRIBUTING.md explaining architectural decisions. The goal was to let anyone spin this up in under 10 minutes and start encoding real videos.",
      ],
    },
    {
      title: "Get Started",
      body: [
        "Clone: git clone https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder",
        "Setup env: cp .env.example .env.local and fill R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and NEXT_PUBLIC_CDN_BASE_URL.",
        "Build Go server: cd upload-server && build.bat (Windows) or go build -o stormz-upload-server main.go (Linux/Mac).",
        "Start server: ./stormz-upload-server (defaults to http://localhost:8081).",
        "Run Next.js: bun install && bun dev → open http://localhost:3000/stream.",
        "Test the flow: create a collection, drag & drop a video file, and watch it upload → encode (with GPU if available) → publish to R2 → appear as 'Ready' in the table.",
      ],
    },
  ],
};

