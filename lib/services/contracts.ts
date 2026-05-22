// Orquestrador de geração de contrato:
//   1) busca dados do request (repo)
//   2) monta prompt + chama IA
//   3) renderiza PDF
//   4) faz upload no R2
//   5) cria registro em request_attachments com category="contract"
//   6) devolve o registro pra UI inserir no feed sem refetch

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db";
import { request_attachments } from "@/lib/schema";
import { loadQuoteByRequestId } from "@/lib/repos/quotes";
import {
  buildContractUserPrompt,
  CONTRACT_SYSTEM_PROMPT,
  type ContractDocument,
  type ProviderInfo,
} from "./contract-prompt";
import { renderContractToPdf } from "./contract-renderer";
import { generateJSON } from "./openai-client";

export class ContractGenerationError extends Error {
  constructor(message: string, public step: string) { super(message); this.name = "ContractGenerationError"; }
}

function providerFromEnv(): ProviderInfo {
  return {
    name: process.env.PROVIDER_NAME ?? "Afonso Kevin Burginski",
    email: process.env.PROVIDER_EMAIL ?? "admin@afonsodev.com",
    whatsapp: process.env.PROVIDER_WHATSAPP ?? "66 99621-2672",
  };
}

function r2PublicUrl(): string {
  return process.env.R2_PUBLIC_URL ?? "https://cdn.afonsodev.com";
}

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "contrato";
}

export interface GeneratedContract {
  attachmentId: string;
  url: string;
  name: string;
  size: number;
}

export async function generateContractForRequest(requestId: string): Promise<GeneratedContract> {
  const quote = await loadQuoteByRequestId(requestId);
  if (!quote) throw new ContractGenerationError("Request not found", "load");

  const provider = providerFromEnv();

  // 1. Chama OpenAI pedindo o doc estruturado
  let doc: ContractDocument;
  try {
    doc = await generateJSON<ContractDocument>({
      systemPrompt: CONTRACT_SYSTEM_PROMPT,
      userPrompt: buildContractUserPrompt({ request: quote, provider }),
      temperature: 0.45,
      maxOutputTokens: 6000,
    });
  } catch (err) {
    console.error("[contracts] OpenAI failure:", err);
    throw new ContractGenerationError(
      err instanceof Error ? err.message : "OpenAI request failed",
      "openai",
    );
  }

  // Validação mínima
  if (!doc?.title || !Array.isArray(doc.blocks) || doc.blocks.length === 0) {
    throw new ContractGenerationError("Invalid contract structure from AI", "validate");
  }

  // 2. Renderiza PDF
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await renderContractToPdf(doc);
  } catch (err) {
    console.error("[contracts] render failure:", err);
    throw new ContractGenerationError(
      err instanceof Error ? err.message : "PDF render failed",
      "render",
    );
  }

  // 3. Upload no R2
  const fileName = `Contrato — ${quote.title.slice(0, 40)}.pdf`;
  const key = `contracts/${requestId}/${Date.now()}-${slugify(quote.title)}.pdf`;
  const { env } = getCloudflareContext({ async: false });
  try {
    await env.R2.put(key, pdfBytes, {
      httpMetadata: { contentType: "application/pdf" },
    });
  } catch (err) {
    console.error("[contracts] R2 upload failure:", err);
    throw new ContractGenerationError(
      err instanceof Error ? err.message : "R2 upload failed",
      "upload",
    );
  }
  const url = `${r2PublicUrl()}/${key}`;

  // 4. Salva attachment
  const [row] = await db
    .insert(request_attachments)
    .values({
      request_id: requestId,
      url,
      name: fileName,
      mime_type: "application/pdf",
      size: pdfBytes.byteLength,
      kind: "file",
      category: "contract",
      position: Date.now(), // sempre vai pro fim
    })
    .returning();

  return {
    attachmentId: row.id,
    url,
    name: fileName,
    size: pdfBytes.byteLength,
  };
}
