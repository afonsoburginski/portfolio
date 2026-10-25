import { z } from "zod";
import { diagramSchema } from "./schema";

let cached: Record<string, unknown> | undefined;

/** JSON Schema (draft 2020-12) of the declarative diagram format, generated from the Zod schema. */
export function diagramJsonSchema(): Record<string, unknown> {
  cached ??= z.toJSONSchema(diagramSchema, { io: "input", unrepresentable: "any" }) as Record<string, unknown>;
  return cached;
}
