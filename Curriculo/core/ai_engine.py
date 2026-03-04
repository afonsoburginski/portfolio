#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ai_engine — Integracao com GPT para analise e geracao de curriculos.

Funcionalidades:
    gerar_md_from_json    Gera curriculo .md a partir de cv_dados.json
    gerar_personalizado   Gera curriculo customizado (vaga, foco, idioma)
    analisar              Analisa curriculo e retorna feedback detalhado
    melhorar              Reescreve/melhora o curriculo inteiro
    adaptar_para_vaga     Adapta curriculo para vaga especifica
    traduzir              Traduz curriculo para outro idioma
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# Carrega .env do diretorio raiz do projeto
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# =====================================================================
#  LAYOUT FIXO — formato Markdown que o docx_builder espera
# =====================================================================
LAYOUT_MD = """# NOME COMPLETO

## Cargo / Titulo Profissional (Especialidade)

Email: email@exemplo.com • Portfolio: site.com • GitHub: github.com/user • LinkedIn: linkedin.com/in/user

## SUMMARY

Paragrafo de resumo profissional com X+ anos de experiencia. Destaque especialidades, impacto e diferenciais.

## SKILLS

Languages: Tech1, Tech2, Tech3
Frameworks & Libraries: Framework1, Framework2
Backend & Data: Tech1, Tech2
Architecture & Patterns: Pattern1, Pattern2
DevOps & Cloud: Tool1, Tool2
Tools & Platforms: Tool1, Tool2

## EXPERIENCE

### Cargo – Empresa
Mes Ano – Mes Ano • Local
- Descricao da atividade ou conquista com metricas quando possivel.
- **Nome do Projeto:** Descricao detalhada do projeto com tecnologias usadas.

## OPEN SOURCE & SELECTED PROJECTS

- **Nome do Projeto** – Descricao com tecnologias e impacto.

## EDUCATION

### Grau em Curso – Instituicao
Ano – Ano

## CERTIFICATIONS & TRAINING

- Nome da Certificacao – Instituicao

## LANGUAGES

Idioma: Nivel (detalhes adicionais)""".strip()

REGRAS_LAYOUT = """REGRAS CRITICAS DE LAYOUT (nao violar NUNCA):
1. Use EXATAMENTE o formato Markdown acima. Nao altere a estrutura.
2. # para nome, ## para secoes, ### para sub-entradas (experiencia/educacao).
3. Linha de contato com separadores " • " (bullet).
4. Skills no formato "Categoria: item1, item2, item3" (sem bullets).
5. Bullets de experiencia com "- " (hifen espaco).
6. Negrito inline com **texto** para nomes de projetos dentro de bullets.
7. NAO use blocos de codigo (```). Retorne markdown PURO.
8. Retorne APENAS o markdown, sem explicacoes ou comentarios."""


# =====================================================================
#  CLASSE PRINCIPAL
# =====================================================================
class AIEngine:
    """Motor de IA para geracao e analise de curriculos usando GPT."""

    def __init__(self, model='gpt-5.2', api_key=None):
        self.model = model
        self.client = OpenAI(api_key=api_key or os.getenv('OPENAI_API_KEY'))

    def _chat(self, system_prompt, user_prompt, temperature=0.7):
        """Envia mensagem ao GPT e retorna a resposta."""
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
        )
        return response.choices[0].message.content.strip()

    # -----------------------------------------------------------------
    #  GERAR CURRICULO A PARTIR DE JSON (padrao)
    # -----------------------------------------------------------------
    def gerar_md_from_json(self, json_path_or_dict):
        """Gera curriculo .md completo a partir de cv_dados.json ou dict."""
        if isinstance(json_path_or_dict, dict):
            dados = json_path_or_dict
        else:
            with open(json_path_or_dict, 'r', encoding='utf-8') as f:
                dados = json.load(f)

        system = f"""Voce e um especialista em redacao de curriculos profissionais para tecnologia.

Receba os dados brutos (JSON) do candidato e gere um curriculo COMPLETO no formato Markdown.

LAYOUT OBRIGATORIO:

{LAYOUT_MD}

{REGRAS_LAYOUT}

REGRAS DE CONTEUDO:
1. Escreva em INGLES profissional (padrao internacional de curriculos tech).
2. Cada bullet de experiencia deve comecar com verbo de acao forte (Led, Built, Architected, Implemented, etc.).
3. Inclua TODAS as metricas e numeros que existem nos dados.
4. O SUMMARY deve ter 3-4 linhas com anos de experiencia, especialidades e impacto comprovado.
5. As SKILLS devem ser organizadas por categoria exatamente como no layout.
6. Se existirem projetos dentro de uma experiencia, use o formato **Nome do Projeto:** Descricao.
7. NAO invente empresas, cargos ou tecnologias que nao existam nos dados.
8. Use TODOS os dados disponiveis — nao omita experiencias, projetos ou certificacoes.
9. O curriculo deve ter 2 paginas no maximo — seja conciso mas completo."""

        user = f"Dados completos do candidato:\n\n{json.dumps(dados, ensure_ascii=False, indent=2)}"

        return self._chat(system, user, temperature=0.5)

    # -----------------------------------------------------------------
    #  GERAR CURRICULO PERSONALIZADO (vaga, foco, idioma)
    # -----------------------------------------------------------------
    def gerar_personalizado(self, json_path_or_dict, instrucoes=None,
                            vaga=None, idioma='English'):
        """Gera curriculo personalizado com foco especifico."""
        if isinstance(json_path_or_dict, dict):
            dados = json_path_or_dict
        else:
            with open(json_path_or_dict, 'r', encoding='utf-8') as f:
                dados = json.load(f)

        extras = []
        if vaga:
            extras.append(f"VAGA ALVO:\n{vaga}\n\nDestaque experiencias e skills MAIS relevantes para esta vaga. Reordene para maximizar impacto.")
        if instrucoes:
            extras.append(f"INSTRUCOES DO USUARIO:\n{instrucoes}")
        if idioma and idioma.lower() != 'english':
            extras.append(f"IDIOMA: Escreva o curriculo inteiro em {idioma}. Adapte nomes das secoes para {idioma}.")

        extra_block = '\n\n'.join(extras) if extras else ''

        system = f"""Voce e um especialista em redacao de curriculos tech e estrategia de candidatura.

Receba os dados completos do candidato e gere um curriculo PERSONALIZADO.

LAYOUT OBRIGATORIO:

{LAYOUT_MD}

{REGRAS_LAYOUT}

REGRAS DE CONTEUDO:
1. Use TODOS os dados relevantes do JSON.
2. Cada bullet deve comecar com verbo de acao forte.
3. Inclua metricas e numeros sempre que disponiveis.
4. NAO invente empresas, cargos ou tecnologias.
5. SELECIONE e PRIORIZE o que e mais relevante (se houver vaga alvo).
6. Maximo 2 paginas — seja estrategico no que incluir.

{extra_block}"""

        user = f"Dados completos do candidato:\n\n{json.dumps(dados, ensure_ascii=False, indent=2)}"

        return self._chat(system, user, temperature=0.5)

    # -----------------------------------------------------------------
    #  ANALISAR CURRICULO
    # -----------------------------------------------------------------
    def analisar(self, md_text):
        """Analisa curriculo e retorna feedback detalhado."""
        system = """Voce e um recrutador senior e especialista em curriculos de tecnologia com 15+ anos de experiencia em empresas como Google, Meta e startups.

Analise o curriculo e retorne um relatorio DETALHADO em portugues com:

1. **NOTA GERAL** (0-10) com justificativa
2. **PONTOS FORTES** — O que esta bom e funciona
3. **PONTOS FRACOS** — O que precisa melhorar
4. **SUGESTOES ESPECIFICAS** — Para cada secao (Summary, Skills, Experience, etc.)
5. **IMPACTO ATS** — Como o curriculo se sairia em sistemas de rastreamento automatico
6. **COMPARACAO COM MERCADO** — Como se compara a curriculos de candidatos similares
7. **ACOES PRIORITARIAS** — Top 5 mudancas que fariam mais diferenca

Seja direto, honesto e construtivo. Use exemplos concretos do proprio curriculo."""

        return self._chat(system, f"Curriculo para analise:\n\n{md_text}", temperature=0.5)

    # -----------------------------------------------------------------
    #  MELHORAR CURRICULO
    # -----------------------------------------------------------------
    def melhorar(self, md_text, instrucoes=None):
        """Reescreve e melhora o curriculo mantendo o formato."""
        extra = f"\n\nINSTRUCOES ADICIONAIS:\n{instrucoes}" if instrucoes else ''

        system = f"""Voce e um especialista em redacao de curriculos tech.

Receba um curriculo existente e MELHORE-O significativamente.

LAYOUT OBRIGATORIO:

{LAYOUT_MD}

{REGRAS_LAYOUT}

REGRAS DE MELHORIA:
1. NAO invente empresas, cargos ou tecnologias inexistentes.
2. MELHORE: verbos de acao, metricas, clareza, impacto, organizacao.
3. REESCREVA bullets fracos com linguagem mais forte e profissional.
4. OTIMIZE para ATS (Applicant Tracking Systems).
5. Mantenha o idioma original.{extra}"""

        return self._chat(system, f"Curriculo para melhorar:\n\n{md_text}", temperature=0.6)

    # -----------------------------------------------------------------
    #  ADAPTAR PARA VAGA
    # -----------------------------------------------------------------
    def adaptar_para_vaga(self, md_text, descricao_vaga):
        """Adapta curriculo para vaga especifica."""
        system = f"""Voce e um especialista em curriculos e estrategia de candidatura.

Adapte o curriculo para a VAGA ESPECIFICA fornecida.

LAYOUT OBRIGATORIO:

{LAYOUT_MD}

{REGRAS_LAYOUT}

REGRAS DE ADAPTACAO:
1. NAO invente experiencias ou habilidades inexistentes.
2. REORGANIZE e DESTAQUE experiencias mais relevantes para a vaga.
3. AJUSTE o Summary para alinhar com o que a vaga pede.
4. REORDENE skills colocando as mais relevantes primeiro.
5. ENFATIZE nos bullets o que se alinha com a vaga.
6. Adicione palavras-chave da vaga de forma natural.
7. Mantenha o idioma original."""

        user = f"CURRICULO:\n\n{md_text}\n\n---\n\nDESCRICAO DA VAGA:\n\n{descricao_vaga}"
        return self._chat(system, user, temperature=0.5)

    # -----------------------------------------------------------------
    #  TRADUZIR CURRICULO
    # -----------------------------------------------------------------
    def traduzir(self, md_text, idioma_destino='English'):
        """Traduz curriculo para outro idioma mantendo o formato."""
        system = f"""Voce e um tradutor profissional especializado em curriculos tech.

Traduza o curriculo para {idioma_destino}.

LAYOUT OBRIGATORIO:

{LAYOUT_MD}

{REGRAS_LAYOUT}

REGRAS DE TRADUCAO:
1. Traduza TODO o conteudo para {idioma_destino}.
2. Adapte termos tecnicos para o padrao do mercado no idioma destino.
3. Mantenha siglas e nomes de tecnologias no original (React, Python, etc).
4. Nomes de empresas ficam no original.
5. Secoes devem usar nomes padrao em {idioma_destino}."""

        return self._chat(system, f"Curriculo para traduzir:\n\n{md_text}", temperature=0.3)
