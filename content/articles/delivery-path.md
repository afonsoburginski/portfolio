---
title: "Streaming That Scales: HLS, LL-HLS or WebRTC?"
subtitle: "How I choose a delivery path before the audience grows: from a handful of operators to a very large number of viewers."
slug: "delivery-path"
date: "2026-10-24"
description: "A decision framework for video delivery: latency, audience size and operational burden, across three very different systems."
---

Video delivery decisions are often framed as protocol comparisons. HLS offers scalability, LL-HLS reduces live latency, and WebRTC supports real-time communication.

All three statements are useful. None tells me which architecture to build.

When I own the media pipeline, I start with three constraints: **the latency the experience actually requires, the number of viewers watching the same stream, and the operational complexity I can realistically support.**

My work on Stormzplus, its open-source FFmpeg transcoder, and the in-development Studio platform provides different perspectives on this problem. Large-scale video monitoring introduces another set of questions, particularly when viewers need to react to live events.

The important distinction is that not every video system has the same delivery problem.

I want to explain how I evaluate those differences, where each protocol fits, and what evidence I would require before calling a decision successful.

## Start with latency: how fast must the viewer see it?

Before choosing a protocol, I ask:

**How fast does the viewer actually need to see the video, and what happens if that requirement is not met?**

This question sounds simple, but it separates several fundamentally different requirements.

For video on demand (VoD), I care about startup time, buffering, seeking, adaptive quality, and playback reliability. The video already exists. There is no live source to catch up with.

For a live broadcast, the delay between capture and presentation becomes relevant. But the viewer may still tolerate a meaningful buffer if that produces more stable playback.

For an interactive monitoring interface, a delay might affect an operator's ability to respond to an event. The acceptable delay depends on the task, not on the fact that the content is live.

These are different optimization targets.

I distinguish **startup latency** from **glass-to-glass latency**. The former measures how long playback takes to begin. The latter measures the delay from capturing a live frame to displaying it to the viewer.

I also separate both from reliability. An aggressive live-latency target is not particularly useful if playback repeatedly stalls.

The alternatives have different characteristics:

- **HLS** uses HTTP-delivered playlists and media segments. It supports live and on-demand playback, multiple variants, and adaptive bitrate selection. See [RFC 8216](https://www.rfc-editor.org/rfc/rfc8216.html).
- **LL-HLS** extends HLS with mechanisms such as partial segments, blocking playlist reload, and preload hints to reduce live delivery delay while retaining HTTP-based distribution. See [Apple's Low-Latency HLS documentation](https://developer.apple.com/documentation/http-live-streaming/enabling-low-latency-http-live-streaming-hls).
- **WebRTC** provides browser-oriented real-time communication capabilities, including media transport negotiated through peer connections. It introduces different requirements around connectivity, session establishment, and media distribution. See the [W3C WebRTC specification](https://www.w3.org/TR/webrtc/) and [RFC 8825](https://www.rfc-editor.org/rfc/rfc8825.html).

None is universally better.

The fastest delivery mechanism is rarely the complete requirement. My objective is to meet the actual latency target without accepting unnecessary complexity elsewhere.

## Pre-compute once, serve from the edge: HLS and CDN for VoD

Stormzplus was my independent subscription video product, developed during 2024–2025. Its delivery architecture used HLS, Cloudflare R2 object storage, and CDN distribution.

The central problem was straightforward: accept uploaded videos, prepare them for playback at different connection qualities, and make them available through web and mobile applications.

This is a case where I wanted media processing and media delivery to be separate concerns.

The pipeline followed this general sequence:

**Upload → Transcode → Multi-bitrate HLS packaging → Object storage → CDN → Player**

The processing side used a Go service to orchestrate FFmpeg with NVIDIA NVENC, producing HLS renditions at multiple resolutions and bitrates.

That matters because uploading a source file is not equivalent to creating a suitable playback asset.

Different devices, network conditions, and bandwidth availability can require different encoded representations. FFmpeg provides the decoding, filtering, encoding, and packaging capabilities to produce those representations. Its [transcoding documentation](https://ffmpeg.org/ffmpeg.html#Transcoding) and [HLS muxer documentation](https://ffmpeg.org/ffmpeg-formats.html#hls-2) describe the relevant mechanisms.

The resulting HLS master playlist references variant streams, allowing a compatible player to select among them as conditions change.

That does not eliminate buffering or guarantee seamless adaptation. Rendition compatibility, segment alignment, encoder configuration, and player behavior still matter.

For delivery, the packaged assets were published to Cloudflare R2 and distributed through a CDN.

I used immutable asset keys and cache headers as part of the design. Immutable media paths make caching and version management easier to reason about: when content changes, publishing new asset keys avoids relying exclusively on invalidating previously cached media.

For repeatable on-demand playback, this architecture has an important property: **the expensive transcoding work can happen before viewers request the video.**

The CDN can then serve existing media objects without requiring a dedicated real-time media session for every viewer.

That is why HLS made sense for Stormzplus.

```diagram
pipeline
```

The player experience was also part of the system. On the web, I built a custom player supporting captions and playback resumption.

On mobile, the React Native/Expo application used `react-native-video` for native HLS playback and shared the backend with the web application.

This gave me two different client environments consuming the same underlying media delivery model.

### The open-source transcoder

I also extracted a related study case into the public [nextjs-ffmpeg-transcoder repository](https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder).

It demonstrates the pipeline with explicit responsibilities:

- A Go upload server exposes `/upload`, `/progress`, and `/health`, streaming multipart uploads to temporary storage.
- A Next.js administrative application orchestrates local FFmpeg/FFprobe processing.
- FFmpeg produces multi-bitrate HLS variants and a master playlist, with optional NVENC acceleration and CPU fallback.
- Generated assets are published to R2, and public URLs are constructed using a configurable CDN base URL.

The interface uses Zustand to manage upload queues and status. Its documented lifecycle is:

`queued → uploading → encoding → publishing → ready`

This state model is important because transcoding is not an instantaneous request-response operation.

However, the repository is a **study case, not a production-ready reference implementation**. Its documented hardening needs include observability, retries, compensation, endpoint security, DRM or encryption, subtitle handling, and CDN configuration.

Those boundaries matter more than promotional claims about upload capacity or performance.

### What still needs validation

I would not infer CDN efficiency or predictable operating costs merely from the presence of R2 and a CDN.

I would validate playback startup, rebuffering, adaptation behavior, cache effectiveness, encoding throughput, and end-to-end delivery costs using a documented measurement method.

Until those measurements exist, the architectural rationale is defensible, but quantitative performance claims are not.

## When delivery isn't the bottleneck: orchestrating async media

Studio is a scene-based workspace for generating and processing images, video, voice, and sound.

Studio is in development. Its public pre-launch preview and model catalog are available, but they are not evidence of production-scale operation.

The engineering problem is different from Stormzplus.

A generated video may take time to become available because an external provider must process a request. The application needs to track that work, handle intermediate states, associate outputs with the correct generation, and process the resulting assets.

Choosing HLS or WebRTC does not solve any of those problems.

The current architecture separates a React client, a Hono server, provider adapters, BullMQ workers, PostgreSQL generation state, and Cloudflare R2 asset storage.

```diagram
async-media
```

Submission and polling workers handle asynchronous generation workflows. PostgreSQL maintains generation state and identifiers.

Asset handling has its own lifecycle: upload intent, upload confirmation, inspection, storage state, and derivation of previews such as thumbnails or audio waveforms.

I consider those boundaries important because **a successfully submitted generation request is not a successfully delivered media asset.**

The system must distinguish a provider accepting work from that work completing, an output becoming available, and the output being suitable for use.

For Studio, delivery decisions should follow the generated asset's purpose.

If a completed video needs ordinary playback, HTTP-based file delivery or HLS could be appropriate depending on format, duration, compatibility, and viewing requirements.

If a future feature requires genuinely interactive, real-time media exchange, WebRTC might become relevant.

Neither possibility is evidence that Studio currently uses those protocols for such workflows.

What the current implementation demonstrates is the separation of asynchronous processing, persisted generation state, and asset management.

It does not yet establish production reliability, measured throughput, or delivery performance.

That distinction is deliberate. Architecture describes how a system is organized; production evidence establishes how that organization behaves under actual operating conditions.

## Live is a different problem: cameras, operators and concurrent viewers

For a large-scale video monitoring platform, I would start by separating the different viewing requirements before selecting a delivery protocol.

The questions are more complex than simply asking whether the camera is live.

Does the viewer need to react immediately to what appears on screen? Is the video being watched continuously, or opened occasionally? Are many viewers watching the same source? Does the application prioritize minimum delay, stable playback, or both?

```diagram
live-paths
```

I would also distinguish viewing from recording and playback. A live monitoring session and a historical recording do not necessarily need the same delivery path.

### When I would consider WebRTC

If an operator needs highly responsive live viewing, WebRTC would be a candidate.

Its real-time communication model is designed for interactive media, with peer connections and transport mechanisms that support low-delay communication.

But using WebRTC introduces operational questions.

The application needs session negotiation and signaling. The WebRTC API does not prescribe the application's signaling mechanism.

Connectivity also requires attention. [ICE, defined in RFC 8445](https://www.rfc-editor.org/rfc/rfc8445.html), gathers candidate transport addresses and performs connectivity checks. It uses STUN and can use TURN relaying when direct connectivity is unavailable.

Relaying can add infrastructure and bandwidth requirements. It is not correct to assume every connection requires TURN, or that every network permits a direct path.

For many concurrent viewers, I would also evaluate the media distribution architecture instead of assuming independent peer connections are sufficient.

A selective forwarding unit (SFU), for example, could be an alternative worth evaluating for redistributing real-time media.

### When I would consider LL-HLS

If operators need a relatively fresh live view but not continuous real-time interaction, LL-HLS would deserve evaluation.

Its partial-segment mechanism can publish media before a complete parent segment becomes available. Blocking playlist reload and preload hints help clients follow the live edge more efficiently.

However, low-latency playback requires compatible packaging, servers, intermediaries, and players. Merely generating shorter segments does not guarantee a particular end-to-end delay.

### When ordinary HLS could be enough

For broader, primarily observational viewing where additional delay is acceptable, ordinary HLS may reduce the need for stateful, real-time distribution infrastructure.

I would still test live-edge delay, stability, and origin/CDN behavior.

## A decision framework: latency × audience × operational burden

I use the following table as an initial decision filter, not an automatic protocol selector.

```diagram
decision
```

| Latency requirement | Viewers per stream | Operational burden | Candidate |
|---|---|---|---|
| On-demand; no live-edge requirement | Potentially many | Lower delivery-session complexity; offline processing required | **HLS** |
| Live; meaningful delay acceptable | Many | HTTP packaging, cache configuration, and player management | **HLS** |
| Live; reduced delay needed | Moderate to many | Partial-segment packaging, LL-HLS-compatible delivery, player tuning | **LL-HLS** |
| Interactive; minimum practical delay is important | Few | Session negotiation, connectivity checks, real-time media infrastructure | **WebRTC** |
| Interactive; minimum practical delay is important | Many | Potentially substantial media distribution and connection-management burden | **WebRTC with evaluated forwarding architecture** |
| Live; latency target not yet established | Unknown or variable | Uncertain | **HLS, LL-HLS, or WebRTC: benchmark first** |

The ambiguous case matters.

Imagine a monitoring dashboard where users want a reasonably current image but do not directly control anything through the video feed.

WebRTC might deliver lower delay than necessary. Ordinary HLS might introduce more delay than users accept. LL-HLS might be a useful compromise, but that cannot be established without a target and measurements.

I would prototype against the actual viewing requirement rather than declaring a winner based on protocol reputation.

### A possible hybrid

A hybrid delivery architecture is also worth considering:

**WebRTC for interactive operators; HLS for a wider, non-interactive audience.**

The same source could serve different consumption patterns through distinct processing and delivery paths.

That separation could prevent the latency requirement of a small interactive audience from dictating the entire distribution architecture.

It would also add complexity: potentially multiple packaging paths, synchronization concerns, access-control requirements, and additional infrastructure to operate.

I would adopt that pattern only if the workload justified it.

## Prove it: what I'd measure before trusting the decision

The validation process I would apply to any of these decisions is where the real work starts.

### Playback behavior

I would measure startup time, rebuffering frequency and duration, rendition-switching behavior, and playback failures across representative desktop and mobile environments.

For live delivery, I would measure glass-to-glass latency separately from startup time, including behavior during network degradation and reconnection.

### Transcoding and publishing

For FFmpeg-based pipelines, I would test representative source formats, encoder fallback behavior, rendition compatibility, incomplete processing, and failed publication.

I would verify that an asset is not marked ready before all required playlists and segments are accessible.

I would also test cleanup and retry behavior after interrupted jobs. A job identifier alone does not make repeated execution safe: retries require explicit idempotency rules and appropriate handling of partial side effects.

### CDN and operational costs

I would examine request patterns, cache configuration, origin fetches, egress, and the cost of preparing and storing multiple renditions.

Immutable asset keys help define cache behavior, but they do not guarantee a high cache-hit ratio. Object storage and CDN delivery likewise do not guarantee low costs.

### Real-time alternatives

For a WebRTC evaluation, I would test session establishment, candidate selection, connectivity failures, relay requirements, media quality under packet loss, and how distribution behaves as simultaneous viewers increase.

For LL-HLS, I would test live-edge stability, partial-segment availability, playlist reload behavior, CDN compatibility, and player support.

I would compare these results against explicit product requirements rather than generic protocol benchmarks.

The learning I can defend today is methodological: **a protocol decision is incomplete until the system has been tested against the constraints that justified it.**

## Pick the requirement, then the protocol

The way I approach video delivery is to identify the actual problem before committing to an architecture.

Stormzplus illustrates why preprocessed, multi-bitrate HLS delivered through object storage and a CDN fits repeatable on-demand playback.

Studio illustrates a different priority: when media is generated asynchronously, reliable orchestration and asset state management matter before the delivery protocol becomes the main decision.

Live monitoring raises harder questions about responsiveness, simultaneous viewers, connectivity, and operational capacity. Those requirements may justify HLS, LL-HLS, WebRTC, or a combination, depending on validated needs.

My preference is not for a particular protocol. It is for an architecture whose complexity is justified by the experience it delivers.

**Latency must be a requirement, not a marketing adjective. Scalability must be tested, not assumed. And operational simplicity is part of engineering quality.**

That is the standard I want to apply whenever I own the media pipeline.

### Public projects and references

- [Stormzplus: Video Streaming Platform](/case-study/stormzplus)
- [Stormzplus Mobile: React Native Video Application](/case-study/stormzplus-mobile)
- [FFmpeg Transcoder: Open-Source Case Study](/case-study/nextjs-ffmpeg-transcoder)
- [FFmpeg Transcoder: GitHub Repository](https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder)
- [Studio: Media Generation Platform (In Development)](/case-study/studio)
- [Portfolio: Afonso Burginski](/)
