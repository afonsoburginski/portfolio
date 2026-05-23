// Prompt + tipos para gerar contrato com IA.
//
// O modelo retorna um documento em blocos. O renderer paginação fica simples
// porque cada bloco é renderizado independentemente em pdf-lib.

import type { QuoteRecord } from "@/lib/repos/quotes";

/* ── Schema do documento retornado pela IA ───────────────────────────── */

export type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "kv"; rows: Array<{ key: string; value: string }> }
  | { type: "clause"; number: string; title: string; body: string }
  | { type: "spacer"; size?: number }
  | { type: "signature"; party: string; lines: string[] };

export interface ContractDocument {
  title: string;
  subtitle?: string;
  metadata: {
    cliente: string;
    contratado: string;
    data: string; // ex.: "26/11/2025"
    validade?: string; // ex.: "7 dias"
  };
  blocks: Block[];
}

/* ── Input do prompt ───────────────────────────────────────────────── */

export interface ProviderInfo {
  name: string;
  email: string;
  /** NÃO incluído no contrato por privacidade. Mantido na interface só por compat. */
  whatsapp?: never;
}

export interface TextAttachment {
  name: string;
  /** ex.: "text/markdown", "text/plain" */
  mimeType: string | null;
  content: string;
}

export interface ContractGenerationInput {
  request: QuoteRecord;
  provider: ProviderInfo;
  /** Conteúdo textual dos anexos (markdown, txt) já fetched do R2. */
  textAttachments?: TextAttachment[];
  /** URLs de imagens dos anexos pra IA enxergar (visão multimodal). */
  imageUrls?: string[];
}

/* ── Prompts ───────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `Você é um advogado brasileiro especialista em direito empresarial + um arquiteto de software sênior. Sua tarefa é gerar um documento ÚNICO em português do Brasil que serve simultaneamente como **Proposta Comercial** e **Contrato de Prestação de Serviços**.

REGRAS DURAS:
1. Resposta DEVE ser JSON válido, no schema descrito.
2. Linguagem formal mas humana — nada de jargão jurídico desnecessário.
3. Use os dados fornecidos como verdade. Não invente valores, prazos, escopo ou cláusulas que conflitem com os dados.
4. Estrutura obrigatória do documento, nesta ordem (use os tipos de bloco corretos):
   - h1 com o título do documento.
   - h2 "Apresentação" + 1 parágrafo (p) introdutório, contextualizando o cliente e o trabalho.
   - h2 "Situação Atual / Necessidade" + 1 parágrafo explicando a dor que motiva o projeto.
   - h2 "Escopo do Trabalho" + h3 por fase/etapa (use as etapas fornecidas), com ul de entregáveis sob cada h3.
   - h2 "Cronograma" + ul ou parágrafos com as datas das etapas (se houver due_date) ou prazos relativos.
   - h2 "Investimento" + kv com Valor total, Forma de pagamento (resumo das etapas), Validade da proposta.
   - h2 "Garantias e Suporte" + ul com 4-6 itens de garantia/SLA realistas para o tipo de serviço.
   - h2 "Sobre o Prestador" + p com a apresentação do prestador (nome, email, whatsapp).
   - h1 "Cláusulas Contratuais" — abre a parte legal.
   - Sequência de "clause" (no mínimo 8, no máximo 12) cobrindo: Objeto, Prazo, Preço e Forma de Pagamento, Obrigações da Contratada, Obrigações da Contratante, Propriedade Intelectual, Confidencialidade, Garantia e Suporte, Rescisão, Foro. Inclua outras pertinentes se fizer sentido pro tipo de serviço (ex.: LGPD pra software, manutenção, hospedagem).
   - h2 "Aceite" — 2 blocos "signature" (Contratante e Contratado) com 2 linhas cada (nome / data).
5. Cláusulas adaptadas ao tipo de serviço — PI faz sentido pra software, SLA muda conforme tipo, etc.
6. Cada "clause" deve ter "number" no formato "1.", "2." etc, "title" curto (ex.: "Objeto"), e "body" com 1-4 frases.
7. O bloco "kv" do Investimento deve incluir uma linha "Forma de pagamento" descrevendo as etapas se elas existirem (ex.: "2 parcelas de R$ 2.400,00 — Kickoff (50%) e Entrega final (50%)"); caso contrário, use a forma vista no orçamento.
8. NÃO inclua placeholders como "[nome aqui]" — preencha tudo com base nos dados fornecidos.

SCHEMA JSON:
{
  "title": string,
  "subtitle"?: string,
  "metadata": { "cliente": string, "contratado": string, "data": string, "validade"?: string },
  "blocks": Block[]
}
Block =
  | { "type": "h1" | "h2" | "h3", "text": string }
  | { "type": "p", "text": string }
  | { "type": "ul", "items": string[] }
  | { "type": "kv", "rows": [{ "key": string, "value": string }] }
  | { "type": "clause", "number": string, "title": string, "body": string }
  | { "type": "spacer", "size"?: number }
  | { "type": "signature", "party": string, "lines": string[] }`;

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function fmtDate(d?: string | null) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function buildContractUserPrompt({
  request,
  provider,
  textAttachments,
  imageUrls,
}: ContractGenerationInput): string {
  const stagesBlock = request.stages.length
    ? request.stages
        .map(
          (s, i) =>
            `  ${i + 1}. ${s.title} — ${fmtBRL(s.amount)}${s.due_date ? ` (vence ${fmtDate(s.due_date)})` : ""}${s.is_extra ? " [extra/avulso]" : ""}`,
        )
        .join("\n")
    : "  (nenhuma etapa cadastrada — pagamento conforme orçamento)";

  const totalEtapas = request.stages.reduce((acc, s) => acc + s.amount, 0);

  return `Gere o documento Proposta + Contrato em JSON conforme o schema, usando ESTES dados:

═══ DADOS DO PEDIDO ═══
ID interno: ${request.id}
Título: ${request.title}
Tipo: ${request.type}
Status atual: ${request.status}
Prioridade: ${request.priority}
Orçamento (campo budget): ${request.budget ?? "(não informado)"}
Total das etapas: ${totalEtapas > 0 ? fmtBRL(totalEtapas) : "(sem etapas)"}
Prazo de pagamento: ${fmtDate(request.payment_deadline) ?? "(não definido)"}
Prazo de entrega: ${fmtDate(request.delivery_deadline) ?? "(não definido)"}

═══ DESCRIÇÃO DO PEDIDO (cliente escreveu) ═══
${request.description}

${
  request.admin_notes
    ? `═══ NOTAS DO ADMIN / CONTEXTO COMERCIAL ═══\n${request.admin_notes}\n`
    : ""
}
═══ ETAPAS / CRONOGRAMA DE PAGAMENTO ═══
${stagesBlock}

═══ CONTRATANTE ═══
Nome: ${request.client?.name ?? "(cliente)"}${request.client?.email ? `\nEmail: ${request.client.email}` : ""}

═══ CONTRATADO (você está representando) ═══
Nome: ${provider.name}
Email: ${provider.email}

IMPORTANTE: Use APENAS nome e email do CONTRATADO. NÃO inclua telefone, WhatsApp, endereço, CPF ou qualquer outro dado pessoal do CONTRATADO — privacidade do prestador. Para contato, só email.

═══ DATA ═══
${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}

${
  textAttachments && textAttachments.length > 0
    ? `═══ ANEXOS TEXTUAIS DO PEDIDO (use como fonte primária do escopo se houver conflito com a descrição curta acima) ═══
${textAttachments
  .map(
    (a, i) =>
      `\n--- Anexo ${i + 1}: ${a.name} (${a.mimeType ?? "text"}) ---\n${
        // Limita cada anexo pra não estourar o contexto
        a.content.slice(0, 20000)
      }${a.content.length > 20000 ? "\n... [truncado em 20kB]" : ""}\n--- fim do Anexo ${i + 1} ---`,
  )
  .join("\n")}
`
    : ""
}${
  imageUrls && imageUrls.length > 0
    ? `═══ IMAGENS ANEXADAS AO PEDIDO ═══
${imageUrls.length} imagem(ns) foram enviadas separadamente no payload — analise-as e use o que for relevante (ex.: mockups, telas, fluxos) na hora de detalhar o escopo e as entregas.
`
    : ""
}
Gere agora o JSON do documento. Lembre: ordem dos blocos é fixa, cláusulas adaptadas ao serviço, sem placeholders.`;
}

export const CONTRACT_SYSTEM_PROMPT = SYSTEM_PROMPT;
