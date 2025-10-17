import { CaseStudy } from "./types";
import { stormzplus } from "./stormzplus";
import { nextjsFfmpegTranscoder } from "./nextjs-ffmpeg-transcoder";
import { orcanorte } from "./orcanorte";
import { gemJhonrob } from "./gem-jhonrob";

export const CASE_STUDIES: Record<string, CaseStudy> = {
  stormzplus,
  "nextjs-ffmpeg-transcoder": nextjsFfmpegTranscoder,
  orcanorte,
  "gem-jhonrob": gemJhonrob,
  // Additional case studies will be added here as separate files
};

export { type CaseStudy } from "./types";

