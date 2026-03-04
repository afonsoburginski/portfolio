#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de Curriculo Profissional com IA — CLI

Comandos:
    python run.py gerar                  Gera .docx a partir do .md
    python run.py ia gerar               Gera .md padrao a partir do JSON
    python run.py ia personalizar        Gera .md customizado (vaga/foco/idioma)
    python run.py ia analisar            Analisa o curriculo e da feedback
    python run.py ia melhorar            Melhora o curriculo com IA
    python run.py ia adaptar             Adapta curriculo para uma vaga
    python run.py ia traduzir [idioma]   Traduz curriculo para outro idioma
    python run.py atualizar              Busca dados frescos das fontes online
"""

import sys
import os

from .docx_builder import create_resume, create_resume_from_text
from .ai_engine import AIEngine
from .scraper import update_cv_dados

# =====================================================================
#  CAMINHOS — raiz do projeto (pai de core/)
# =====================================================================
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_MD = os.path.join(ROOT_DIR, 'curriculo.md')
DEFAULT_DOCX = os.path.join(ROOT_DIR, 'output', 'curriculo.docx')
DEFAULT_JSON = os.path.join(ROOT_DIR, 'cv_dados.json')
GPT_MODEL = 'gpt-5.2'


# =====================================================================
#  UTILIDADES
# =====================================================================
def _print_header(titulo):
    print()
    print('=' * 60)
    print(f'  {titulo}')
    print('=' * 60)
    print()


def _ler_md(path=None):
    path = path or DEFAULT_MD
    if not os.path.exists(path):
        print(f'[ERRO] Arquivo nao encontrado: {path}')
        sys.exit(1)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def _salvar_md(texto, path=None):
    path = path or DEFAULT_MD
    with open(path, 'w', encoding='utf-8') as f:
        f.write(texto)
    print(f'[OK] Markdown salvo em: {path}')


def _garantir_output_dir():
    os.makedirs(os.path.join(ROOT_DIR, 'output'), exist_ok=True)


def _limpar_blocos_codigo(texto):
    """Remove blocos de codigo markdown que a IA pode adicionar."""
    lines = texto.split('\n')
    cleaned = []
    in_code_block = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('```'):
            in_code_block = not in_code_block
            continue
        if not in_code_block:
            cleaned.append(line)
    return '\n'.join(cleaned)


def _perguntar_gerar_docx(md_path, docx_name=None):
    """Pergunta se quer gerar .docx e gera."""
    resposta = input('\nDeseja gerar o .docx agora? (s/n): ').strip().lower()
    if resposta in ('s', 'sim', 'y', 'yes', ''):
        _garantir_output_dir()
        docx_path = os.path.join(ROOT_DIR, 'output', docx_name or 'curriculo.docx')
        create_resume(md_path, docx_path)


# =====================================================================
#  COMANDOS
# =====================================================================
def cmd_gerar(args):
    """Gera .docx a partir de .md"""
    _garantir_output_dir()
    md_path = args[0] if args else DEFAULT_MD
    docx_path = args[1] if len(args) > 1 else DEFAULT_DOCX
    _print_header('Gerando documento Word')
    create_resume(md_path, docx_path)


def cmd_atualizar(args):
    """Busca dados frescos das fontes online e atualiza cv_dados.json."""
    _print_header('Atualizando dados das fontes online')
    json_path = args[0] if args else DEFAULT_JSON
    update_cv_dados(json_path, model=GPT_MODEL)


def cmd_ia_gerar(args):
    """Gera curriculo em duas versoes (EN + PT-BR) a partir do cv_dados.json."""
    _print_header('IA -- Gerando curriculo (English + PT-BR)')
    json_path = args[0] if args else DEFAULT_JSON

    if not os.path.exists(json_path):
        print(f'[ERRO] Arquivo JSON nao encontrado: {json_path}')
        sys.exit(1)

    ai = AIEngine(model=GPT_MODEL)
    _garantir_output_dir()

    # --- Versao English ---
    print(f'[1/2] Gerando versao English com {GPT_MODEL}...')
    md_en = ai.gerar_md_from_json(json_path)
    md_en = _limpar_blocos_codigo(md_en)

    md_en_path = os.path.join(ROOT_DIR, 'curriculo_en.md')
    _salvar_md(md_en, md_en_path)
    docx_en_path = os.path.join(ROOT_DIR, 'output', 'curriculo_en.docx')
    create_resume(md_en_path, docx_en_path)

    # --- Versao PT-BR ---
    print(f'\n[2/2] Gerando versao Portugues (PT-BR) com {GPT_MODEL}...')
    md_ptbr = ai.gerar_personalizado(json_path, idioma='Portugues Brasileiro')
    md_ptbr = _limpar_blocos_codigo(md_ptbr)

    md_ptbr_path = os.path.join(ROOT_DIR, 'curriculo_ptbr.md')
    _salvar_md(md_ptbr, md_ptbr_path)
    docx_ptbr_path = os.path.join(ROOT_DIR, 'output', 'curriculo_ptbr.docx')
    create_resume(md_ptbr_path, docx_ptbr_path)

    # Manter o curriculo.md como a versao EN (padrao)
    _salvar_md(md_en, DEFAULT_MD)

    print('\n[OK] Duas versoes geradas com sucesso!')
    print(f'     EN:    output/curriculo_en.docx')
    print(f'     PT-BR: output/curriculo_ptbr.docx')


def cmd_ia_personalizar(args):
    """Gera curriculo personalizado em EN + PT-BR."""
    _print_header('IA -- Gerando curriculo personalizado (EN + PT-BR)')
    json_path = args[0] if args else DEFAULT_JSON

    if not os.path.exists(json_path):
        print(f'[ERRO] Arquivo JSON nao encontrado: {json_path}')
        sys.exit(1)

    # Coletar informacoes
    print('Para qual vaga? (Cole a descricao, ou Enter para pular):')
    vaga_lines = []
    first = True
    while True:
        linha = input('> ' if first else '  ')
        first = False
        if not linha.strip():
            break
        vaga_lines.append(linha)
    vaga = '\n'.join(vaga_lines) if vaga_lines else None

    print('\nInstrucoes adicionais? (ex: "foco em mobile", Enter para pular):')
    instrucoes = input('> ').strip() or None

    slug = 'para_vaga' if vaga else 'personalizado'

    ai = AIEngine(model=GPT_MODEL)
    _garantir_output_dir()

    # --- Versao English ---
    print(f'\n[1/2] Gerando versao English com {GPT_MODEL}...')
    md_en = ai.gerar_personalizado(
        json_path, instrucoes=instrucoes, vaga=vaga, idioma='English'
    )
    md_en = _limpar_blocos_codigo(md_en)

    md_en_path = os.path.join(ROOT_DIR, f'curriculo_{slug}_en.md')
    _salvar_md(md_en, md_en_path)
    docx_en_path = os.path.join(ROOT_DIR, 'output', f'curriculo_{slug}_en.docx')
    create_resume(md_en_path, docx_en_path)

    # --- Versao PT-BR ---
    print(f'\n[2/2] Gerando versao Portugues (PT-BR) com {GPT_MODEL}...')
    md_ptbr = ai.gerar_personalizado(
        json_path, instrucoes=instrucoes, vaga=vaga, idioma='Portugues Brasileiro'
    )
    md_ptbr = _limpar_blocos_codigo(md_ptbr)

    md_ptbr_path = os.path.join(ROOT_DIR, f'curriculo_{slug}_ptbr.md')
    _salvar_md(md_ptbr, md_ptbr_path)
    docx_ptbr_path = os.path.join(ROOT_DIR, 'output', f'curriculo_{slug}_ptbr.docx')
    create_resume(md_ptbr_path, docx_ptbr_path)

    print(f'\n[OK] Duas versoes geradas com sucesso!')
    print(f'     EN:    output/curriculo_{slug}_en.docx')
    print(f'     PT-BR: output/curriculo_{slug}_ptbr.docx')


def cmd_ia_analisar(args):
    """Analisa o curriculo e da feedback detalhado."""
    _print_header('IA -- Analisando curriculo')
    md_path = args[0] if args else DEFAULT_MD
    md_text = _ler_md(md_path)

    ai = AIEngine(model=GPT_MODEL)
    print(f'[...] Analisando com {GPT_MODEL}...\n')
    resultado = ai.analisar(md_text)

    print(resultado)
    print()

    analise_path = os.path.join(ROOT_DIR, 'output', 'analise.txt')
    _garantir_output_dir()
    with open(analise_path, 'w', encoding='utf-8') as f:
        f.write(resultado)
    print(f'[OK] Analise salva em: {analise_path}')


def cmd_ia_melhorar(args):
    """Melhora o curriculo com IA."""
    _print_header('IA -- Melhorando curriculo')
    md_path = args[0] if args else DEFAULT_MD
    md_text = _ler_md(md_path)

    print('Instrucoes adicionais (opcional, Enter para pular):')
    instrucoes = input('> ').strip() or None

    ai = AIEngine(model=GPT_MODEL)
    print(f'\n[...] Melhorando com {GPT_MODEL}...')
    md_melhorado = ai.melhorar(md_text, instrucoes)
    md_melhorado = _limpar_blocos_codigo(md_melhorado)

    melhorado_path = os.path.join(ROOT_DIR, 'curriculo_melhorado.md')
    _salvar_md(md_melhorado, melhorado_path)
    _perguntar_gerar_docx(melhorado_path, 'curriculo_melhorado.docx')


def cmd_ia_adaptar(args):
    """Adapta curriculo para vaga especifica."""
    _print_header('IA -- Adaptando curriculo para vaga')
    md_path = args[0] if args else DEFAULT_MD
    md_text = _ler_md(md_path)

    print('Cole a descricao da vaga (termine com uma linha vazia):')
    linhas_vaga = []
    while True:
        linha = input()
        if not linha.strip() and linhas_vaga:
            break
        linhas_vaga.append(linha)

    descricao_vaga = '\n'.join(linhas_vaga)
    if not descricao_vaga.strip():
        print('[ERRO] Descricao da vaga nao pode ser vazia.')
        sys.exit(1)

    ai = AIEngine(model=GPT_MODEL)
    print(f'\n[...] Adaptando com {GPT_MODEL}...')
    md_adaptado = ai.adaptar_para_vaga(md_text, descricao_vaga)
    md_adaptado = _limpar_blocos_codigo(md_adaptado)

    adaptado_path = os.path.join(ROOT_DIR, 'curriculo_adaptado.md')
    _salvar_md(md_adaptado, adaptado_path)
    _perguntar_gerar_docx(adaptado_path, 'curriculo_adaptado.docx')


def cmd_ia_traduzir(args):
    """Traduz curriculo para outro idioma."""
    _print_header('IA -- Traduzindo curriculo')

    idioma = args[0] if args else None
    md_path = args[1] if len(args) > 1 else DEFAULT_MD

    if not idioma:
        print('Para qual idioma deseja traduzir?')
        print('  1. English')
        print('  2. Portugues')
        print('  3. Espanol')
        print('  4. Outro')
        escolha = input('\nEscolha (1-4): ').strip()
        idiomas = {'1': 'English', '2': 'Portugues', '3': 'Espanol'}
        idioma = idiomas.get(escolha) or input('Digite o idioma: ').strip()

    md_text = _ler_md(md_path)

    ai = AIEngine(model=GPT_MODEL)
    print(f'\n[...] Traduzindo para {idioma} com {GPT_MODEL}...')
    md_traduzido = ai.traduzir(md_text, idioma)
    md_traduzido = _limpar_blocos_codigo(md_traduzido)

    slug = idioma.lower().replace(' ', '_')
    traduzido_path = os.path.join(ROOT_DIR, f'curriculo_{slug}.md')
    _salvar_md(md_traduzido, traduzido_path)
    _perguntar_gerar_docx(traduzido_path, f'curriculo_{slug}.docx')


# =====================================================================
#  AJUDA
# =====================================================================
def cmd_ajuda():
    print("""
+==============================================================+
|           GERADOR DE CURRICULO PROFISSIONAL COM IA           |
+==============================================================+
|                                                              |
|  COMANDOS BASICOS:                                           |
|    python run.py gerar               Gera .docx do .md       |
|    python run.py atualizar           Busca dados online      |
|                                                              |
|  COMANDOS COM IA (GPT 5.2):                                  |
|    python run.py ia gerar            Gera .md dos dados JSON |
|    python run.py ia personalizar     Gera para vaga/foco     |
|    python run.py ia analisar         Analisa e da feedback   |
|    python run.py ia melhorar         Melhora o curriculo     |
|    python run.py ia adaptar          Adapta para uma vaga    |
|    python run.py ia traduzir [lang]  Traduz para outro idioma|
|                                                              |
|  FLUXO RECOMENDADO:                                          |
|    1. Edite cv_dados.json (ou use 'atualizar')               |
|    2. python run.py ia personalizar                          |
|    3. python run.py gerar                                    |
|                                                              |
|  FONTES DE DADOS:                                            |
|    cv_dados.json    Seus dados completos                     |
|    afonsodev.com    Portfolio (scraping automatico)          |
|    LinkedIn         Perfil profissional                      |
|    GitHub           Projetos e contribuicoes                 |
|                                                              |
+==============================================================+
""")


# =====================================================================
#  ENTRY POINT
# =====================================================================
def main(argv=None):
    """Ponto de entrada principal."""
    args = argv if argv is not None else sys.argv[1:]

    if not args or args[0] in ('--help', '-h', 'ajuda', 'help'):
        cmd_ajuda()
        return

    comando = args[0].lower()

    if comando == 'gerar':
        cmd_gerar(args[1:])
    elif comando == 'atualizar':
        cmd_atualizar(args[1:])
    elif comando == 'ia':
        if len(args) < 2:
            print('[ERRO] Especifique: gerar, personalizar, analisar, melhorar, adaptar, traduzir')
            sys.exit(1)

        cmds = {
            'gerar': cmd_ia_gerar,
            'personalizar': cmd_ia_personalizar,
            'analisar': cmd_ia_analisar,
            'melhorar': cmd_ia_melhorar,
            'adaptar': cmd_ia_adaptar,
            'traduzir': cmd_ia_traduzir,
        }

        sub = args[1].lower()
        if sub in cmds:
            cmds[sub](args[2:])
        else:
            print(f'[ERRO] Subcomando desconhecido: {sub}')
            print('       Use: gerar, personalizar, analisar, melhorar, adaptar, traduzir')
            sys.exit(1)
    else:
        print(f'[ERRO] Comando desconhecido: {comando}')
        cmd_ajuda()
        sys.exit(1)
