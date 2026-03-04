#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scraper — Busca dados atualizados do portfolio, LinkedIn e GitHub.

Usa GPT para extrair e estruturar os dados scraped em formato JSON
compativel com cv_dados.json.
"""

import json
import os
import urllib.request
import urllib.error
import ssl
from .ai_engine import AIEngine

# Ignorar verificacao SSL para scraping simples
_CTX = ssl.create_default_context()
_CTX.check_hostname = False
_CTX.verify_mode = ssl.CERT_NONE

SOURCES = {
    'portfolio': 'https://afonsodev.com',
    'github': 'https://github.com/afonsoburginski',
    'linkedin': 'https://www.linkedin.com/in/afonsoburginski',
}

CASE_STUDIES = [
    'https://afonsodev.com/case-study/gem-jhonrob',
    'https://afonsodev.com/case-study/stormzplus',
    'https://afonsodev.com/case-study/orcanorte',
    'https://afonsodev.com/case-study/easydriver',
    'https://afonsodev.com/case-study/nextjs-ffmpeg-transcoder',
]


def _fetch(url, timeout=15):
    """Faz GET simples e retorna o texto da pagina."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                          'AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8',
        })
        with urllib.request.urlopen(req, timeout=timeout, context=_CTX) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'  [AVISO] Nao foi possivel acessar {url}: {e}')
        return None


def _strip_html(html):
    """Remove tags HTML de forma simples para obter texto puro."""
    import re
    # Remove scripts e styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Limpa espacos
    text = re.sub(r'\s+', ' ', text)
    # Decode HTML entities
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&#8211;', '-').replace('&#8212;', '-')
    text = text.replace('&nbsp;', ' ').replace('&#39;', "'")
    return text.strip()


def fetch_all_sources():
    """Busca dados de todas as fontes e retorna textos brutos."""
    print('[...] Buscando dados das fontes online...\n')
    results = {}

    for name, url in SOURCES.items():
        print(f'  Buscando {name}: {url}')
        html = _fetch(url)
        if html:
            results[name] = _strip_html(html)[:8000]  # Limitar tamanho
            print(f'  [OK] {name}: {len(results[name])} caracteres')
        else:
            results[name] = None

    # Case studies do portfolio
    case_texts = []
    for url in CASE_STUDIES:
        print(f'  Buscando case study: {url.split("/")[-1]}')
        html = _fetch(url)
        if html:
            text = _strip_html(html)[:4000]
            case_texts.append(text)
            print(f'  [OK] {url.split("/")[-1]}: {len(text)} caracteres')

    if case_texts:
        results['case_studies'] = '\n\n---\n\n'.join(case_texts)

    print()
    return results


def update_cv_dados(cv_dados_path, model='gpt-5.2'):
    """Busca dados online e usa GPT para atualizar o cv_dados.json."""

    # Carregar dados atuais
    with open(cv_dados_path, 'r', encoding='utf-8') as f:
        current_data = json.load(f)

    # Buscar dados frescos
    sources = fetch_all_sources()
    fetched_texts = {k: v for k, v in sources.items() if v}

    if not fetched_texts:
        print('[AVISO] Nenhuma fonte acessivel. Mantendo dados atuais.')
        return current_data

    ai = AIEngine(model=model)

    system = """Voce e um assistente que atualiza dados de curriculo.

Voce recebera:
1. O JSON atual do curriculo (cv_dados.json)
2. Textos extraidos de fontes online (portfolio, LinkedIn, GitHub, case studies)

Sua tarefa:
- ATUALIZE o JSON com informacoes novas ou mais detalhadas encontradas nas fontes.
- ADICIONE metricas, tecnologias, atividades ou projetos que estejam nas fontes mas nao no JSON.
- NAO REMOVA informacoes do JSON atual que nao aparecem nas fontes (podem ser validas).
- MANTENHA a estrutura EXATA do JSON (mesmas chaves, mesmo formato).
- Retorne APENAS o JSON atualizado, sem explicacoes.
- NAO use blocos de codigo. Retorne o JSON puro."""

    user = f"""JSON ATUAL:

{json.dumps(current_data, ensure_ascii=False, indent=2)}

---

DADOS EXTRAIDOS DAS FONTES:

"""
    for source, text in fetched_texts.items():
        user += f"=== {source.upper()} ===\n{text}\n\n"

    print(f'[...] Analisando dados com {model}...')
    result = ai._chat(system, user, temperature=0.3)

    # Limpar e parsear resultado
    result = result.strip()
    if result.startswith('```'):
        lines = result.split('\n')
        result = '\n'.join(lines[1:-1] if lines[-1].strip() == '```' else lines[1:])

    try:
        updated_data = json.loads(result)
        # Salvar backup do atual
        backup_path = cv_dados_path.replace('.json', '_backup.json')
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, ensure_ascii=False, indent=2)
        print(f'[OK] Backup salvo em: {backup_path}')

        # Salvar atualizado
        with open(cv_dados_path, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=2)
        print(f'[OK] cv_dados.json atualizado com sucesso!')

        return updated_data

    except json.JSONDecodeError as e:
        print(f'[ERRO] Resposta da IA nao e JSON valido: {e}')
        print('[INFO] Mantendo dados atuais.')
        return current_data
