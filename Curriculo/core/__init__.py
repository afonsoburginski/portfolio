"""
Core — Modulos de logica do Gerador de Curriculo.

    core.docx_builder   -> Geracao do documento Word (.docx)
    core.ai_engine      -> Integracao com GPT (analise, geracao, melhoria)
    core.scraper        -> Busca dados do portfolio, LinkedIn e GitHub
    core.main           -> CLI e logica de comandos

API para uso externo (interface web, etc.):
    from core import AIEngine, create_resume, create_resume_from_text
    from core.scraper import update_cv_dados, fetch_all_sources
    from core.main import main
"""

from .docx_builder import create_resume, create_resume_from_text
from .ai_engine import AIEngine
from .main import main as run_cli