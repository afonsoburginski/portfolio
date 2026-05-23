// Thin wrapper around the OpenAI SDK so callers don't import it directly.
// Centraliza modelo, retry e parsing de JSON.

import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

interface JsonOptions {
  systemPrompt: string;
  userPrompt: string;
  /** URLs de imagens para passar pro modelo via visão multimodal. */
  imageUrls?: string[];
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Chama o modelo pedindo resposta em JSON. Faz fallback de parse robusto
 * (extrai o primeiro bloco { ... } caso o modelo retorne com lixo em volta).
 */
export async function generateJSON<T>({
  systemPrompt,
  userPrompt,
  imageUrls,
  model = DEFAULT_MODEL,
  temperature = 0.4,
  maxOutputTokens = 4096,
}: JsonOptions): Promise<T> {
  const client = getClient();
  // GPT-5+ usa `max_completion_tokens` no lugar de `max_tokens`.
  const isModernModel = /^(gpt-5|o\d|gpt-4\.\d)/i.test(model);

  // Monta o conteúdo do user em forma multi-modal quando houver imagens
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userContent: any = imageUrls && imageUrls.length > 0
    ? [
        { type: "text", text: userPrompt },
        ...imageUrls.map((url) => ({
          type: "image_url" as const,
          image_url: { url },
        })),
      ]
    : userPrompt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  };
  if (isModernModel) {
    params.max_completion_tokens = maxOutputTokens;
    // gpt-5+ não aceita temperature !== 1 — só deixa o default.
  } else {
    params.max_tokens = maxOutputTokens;
    params.temperature = temperature;
  }

  const response = await client.chat.completions.create(params);

  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw) throw new Error("OpenAI returned empty response");

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Tenta extrair o JSON do meio do texto
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("OpenAI response is not valid JSON");
    return JSON.parse(match[0]) as T;
  }
}
