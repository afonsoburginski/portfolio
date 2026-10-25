---
title: "Netflix Ships Hardware to ISPs. Copy the Habit, Not the Scale"
subtitle: "What Open Connect, Cloudflare Stream and Amazon IVS reveal about choosing HLS, LL-HLS or WebRTC, and how I apply it to my own pipelines."
slug: "delivery-path"
date: "2026-10-24"
description: "Three questions (how late, how many viewers, how much infrastructure) decide between HLS, LL-HLS and WebRTC. With vendor facts and my own pipelines."
---

I have never run a platform like Netflix or Prime Video, and I don't have their scale. What I can do is read how they and the cloud vendors describe their choices, and use the same questions on the systems I do build.

Those questions are short. How late can the picture be? How many people watch the same stream? How much infrastructure can I keep running? The protocol (HLS, LL-HLS or WebRTC) falls out of the answers, not the other way around.

I'll use three of my own systems as examples: Stormzplus, a video product I built; Studio, which is still in development; and live camera monitoring, which I describe in general terms only.

## What the big platforms actually do

I checked each of these against the vendor's own documentation. I left out everything I couldn't source.

- **Netflix puts servers inside ISPs.** Through Open Connect, Netflix offers qualifying ISPs appliances that "can be embedded in your ISP network", and each one offloads Netflix traffic from the ISP's peering and transit links. The lesson for me is that the biggest players move the bytes closer to the viewer. See [Netflix Open Connect](https://openconnect.netflix.com/en/).
- **Cloudflare sells both paths, and says they don't mix yet.** Stream delivers video with adaptive bitrate ([Cloudflare Stream docs](https://developers.cloudflare.com/stream/)). Its WebRTC option (WHIP to send, WHEP to watch) advertises under 500 ms of latency. In the same page, when I read it, live HLS playback and recording were "not yet supported" for those streams ([Stream WebRTC docs](https://developers.cloudflare.com/stream/webrtc-beta/)). Low delay and the cheap, cacheable path were two separate products.
- **Amazon IVS splits them too.** Its docs list "low latency" channels under 5 seconds and "real-time" stages under 300 ms, and they say a traditional stream can be as much as 30 seconds behind ([Amazon IVS docs](https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/what-is.html)). Three tiers, three price and complexity levels.

None of this tells me how Netflix or Prime Video build their players or their live stack, so I won't guess. What I take from it is the habit: they pick a tier per use case instead of one protocol for everything.

## Start with latency: how fast must the viewer see it?

Ask one question first: what happens if the picture is late?

A movie can sit behind a buffer of many seconds, and nobody cares. A camera at a building entrance is different. If the operator sees the person at the door ten seconds late, the video is useless for opening it.

So I separate three things:

- **Startup time:** how long until playback begins.
- **Glass-to-glass latency:** the time from the camera capturing a frame to the viewer seeing it.
- **Stability:** a very low latency is worthless if the player stalls every minute.

The three options, in one line each:

- **HLS** cuts the video into small files (segments) and lists them in a playlist the player downloads over plain HTTP. It handles live, on-demand and adaptive quality. See [RFC 8216](https://www.rfc-editor.org/rfc/rfc8216.html).
- **LL-HLS** is HLS where the server publishes partial segments, pieces of a segment that aren't finished yet, and the player can ask the server to hold a playlist request until the next piece exists. Same HTTP, less waiting. See [Apple's Low-Latency HLS documentation](https://developer.apple.com/documentation/http-live-streaming/enabling-low-latency-http-live-streaming-hls).
- **WebRTC** is the real-time technology behind video calls in the browser. It needs signaling and a connectivity step I explain below. See the [W3C WebRTC specification](https://www.w3.org/TR/webrtc/) and [RFC 8825](https://www.rfc-editor.org/rfc/rfc8825.html).

The fastest option is rarely the one I need. I want the latency the product requires, and no extra complexity beyond that.

## Pre-compute once, serve from the edge: HLS and CDN for VoD

```logos
cloudflare
```

Stormzplus was my own subscription video product, built in 2024 and 2025. Videos go through the pipeline once. After that, every viewer just downloads files.

The flow is: upload, transcode, package as multi-bitrate HLS, store in :cloudflare: Cloudflare R2, serve through a CDN, play.

A Go service runs FFmpeg with NVIDIA NVENC and produces several resolutions and bitrates. An uploaded file is not yet something a phone on a weak connection can play. The master playlist lists the variants, and the player switches between them as the network changes. FFmpeg's [transcoding docs](https://ffmpeg.org/ffmpeg.html#Transcoding) and [HLS muxer docs](https://ffmpeg.org/ffmpeg-formats.html#hls-2) cover the details. Switching doesn't remove buffering. Encoder settings, segment alignment and the player still matter.

Published files get immutable keys. When a video changes, I publish new keys instead of hoping a cache invalidation reaches every edge.

The key property is that **the expensive work happens before anyone presses play.** The CDN serves ordinary files, and no viewer needs a live media session. That is why HLS fit this product.

```diagram
pipeline
```

On the web I wrote a custom player with captions and resume. The React Native/Expo app uses `react-native-video` for native HLS and shares the backend.

### The open-source transcoder

I extracted a study case from this work into the public [nextjs-ffmpeg-transcoder repository](https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder):

- A Go upload server with `/upload`, `/progress` and `/health` streams multipart uploads to temporary storage.
- A Next.js admin app drives local FFmpeg and FFprobe.
- FFmpeg produces multi-bitrate HLS and a master playlist, with NVENC when available and a CPU fallback.
- Output goes to R2, and public URLs are built from a configurable CDN base URL.

Jobs move through `queued → uploading → encoding → publishing → ready`, because transcoding takes time and the UI has to show it.

It is a study case, not a production reference. Its own notes list what is missing: observability, retries, compensation, endpoint security, DRM or encryption, subtitles and CDN configuration.

### What still needs validation

Having R2 and a CDN doesn't prove the cache works well or that costs stay low. I would measure startup time, rebuffering, rendition switching, cache hits, encoding throughput and delivery cost, with the method written down. Until then the design is reasonable, and the numbers are unknown.

## When delivery isn't the bottleneck: orchestrating async media

Studio is a scene-based workspace for generating images, video, voice and sound. It is in development. The public preview and model catalog exist, but they say nothing about production scale.

Its hard problem isn't delivery. A generated video can take a while because an outside provider does the work. The app has to remember what it asked for, track the state, match the result to the right request, and then handle the file.

HLS or WebRTC solves none of that.

The design splits a React client, a Hono API, provider adapters, BullMQ workers, PostgreSQL for generation state and Cloudflare R2 for assets.

```diagram
async-media
```

Workers submit jobs and poll for results, and PostgreSQL keeps the state. Assets have their own life cycle: upload, confirmation, inspection, then previews such as thumbnails or waveforms.

**A request the provider accepted is not a file the user can play.** Accepted, finished, available and usable are four different states, and the system has to tell them apart.

Delivery comes later and depends on what the asset is for. An ordinary finished video can be a file over HTTP or HLS. If a feature ever needs live, two-way media, WebRTC becomes a candidate. Studio doesn't do that today.

What exists today is that separation. Production reliability and throughput are not proven.

## Live is a different problem: cameras, operators and concurrent viewers

For a large video monitoring platform, I would split the viewing needs before touching protocols. The live/not-live question is too coarse.

Does the viewer have to react to what they see? Do they watch continuously or open the stream now and then? How many people watch the same source? Do I want the lowest delay, the steadiest picture, or both?

```diagram
live-paths
```

### When I would consider WebRTC

If an operator needs a very fast live view, WebRTC is the candidate. It was built for interactive media.

It brings work with it. The API does not define signaling, so I have to build the way two sides agree on a session. Connectivity is the other part: [ICE, defined in RFC 8445](https://www.rfc-editor.org/rfc/rfc8445.html), collects the possible network addresses and tests them, using STUN to discover addresses and TURN to relay traffic when no direct path works. Relaying costs bandwidth and servers. Not every connection needs it, and not every network allows a direct path.

With many viewers on the same stream, I wouldn't assume a connection per viewer is enough. A selective forwarding unit (SFU), a server that receives one stream and forwards it to many viewers, is worth evaluating.

### When I would consider LL-HLS

If operators want a fresh picture but don't need real-time interaction, LL-HLS deserves a test. Partial segments let the player see media before the full segment is done, and blocking reload plus preload hints help it follow the live edge.

Shorter segments alone don't give low delay. The packager, the servers in between and the player all have to support LL-HLS.

### When ordinary HLS could be enough

If people mostly watch passively and a few extra seconds are fine, plain HLS keeps the infrastructure simple. I would still test live-edge delay, stability and how origin and CDN behave.

## A decision framework: latency × audience × operational burden

This table is a first filter, not an automatic selector.

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

The last row is the common one. Picture a dashboard where people want a reasonably current image and don't control anything with it. WebRTC may be faster than needed. Plain HLS may be too slow. LL-HLS might fit, but nobody can say without a target and a measurement. I would prototype against the real viewing need.

### A possible hybrid

You can also split by audience: **WebRTC for the few operators who act, HLS for everyone who only watches.** One source, two paths. The few don't force their latency requirement on the whole distribution.

The price is more packaging paths, possible sync issues, access control on both, and more to operate. I would only do it if the workload justified it.

## Prove it: what I'd measure before trusting the decision

A choice isn't done until I've tested it against the reason I made it.

### Playback behavior

Startup time, rebuffering, rendition switching and failures, on desktop and mobile. For live, glass-to-glass latency on its own, including network drops and reconnects.

### Transcoding and publishing

Real source files, encoder fallback, rendition compatibility, half-finished jobs and failed publishes. An asset must not be marked ready before every playlist and segment can be fetched. After an interrupted job, retries need explicit idempotency rules. A job ID alone doesn't make a repeat safe.

### CDN and operational costs

Origin fetches, cache hits, egress, and the cost of storing several renditions. Immutable keys help caching but don't guarantee a high hit rate.

### Real-time alternatives

For WebRTC: session setup, relay needs, quality under packet loss, and what happens as viewers are added. For LL-HLS: live-edge stability, CDN compatibility and player support. I compare results against the product's requirements, not generic benchmarks.

## Pick the requirement, then the protocol

Stormzplus shows why pre-processed HLS on object storage and a CDN suits on-demand playback. Studio shows that with async generation, job and asset state come before the delivery protocol. Live monitoring raises the hard questions: responsiveness, viewers, connectivity and who runs it.

I don't have a favorite protocol. I want the lightest architecture that still meets the requirement.

**Latency should be a requirement, not an adjective. Scale should be tested, not assumed. Simple operations count as engineering quality.**

### Public projects and references

- [Stormzplus: Video Streaming Platform](/case-study/stormzplus)
- [Stormzplus Mobile: React Native Video Application](/case-study/stormzplus-mobile)
- [FFmpeg Transcoder: Open-Source Case Study](/case-study/nextjs-ffmpeg-transcoder)
- [FFmpeg Transcoder: GitHub Repository](https://github.com/afonsoburginski/nextjs-ffmpeg-transcoder)
- [Studio: Media Generation Platform (In Development)](/case-study/studio)
- [Portfolio: Afonso Burginski](/)
