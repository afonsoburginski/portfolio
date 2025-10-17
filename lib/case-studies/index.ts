import { CaseStudy } from "./types";
import { stormzplus } from "./stormzplus";
import { nextjsFfmpegTranscoder } from "./nextjs-ffmpeg-transcoder";
import { orcanorte } from "./orcanorte";
import { gemJhonrob } from "./gem-jhonrob";
import { easydriver } from "./easydriver";

export const CASE_STUDIES: Record<string, CaseStudy> = {
  stormzplus,
  "nextjs-ffmpeg-transcoder": nextjsFfmpegTranscoder,
  orcanorte,
  "gem-jhonrob": gemJhonrob,
  easydriver,
  // Additional case studies will be added here as separate files
};

export { type CaseStudy } from "./types";

