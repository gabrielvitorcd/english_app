"""Fábrica da aplicação: `uvicorn app.main:app` (ou create_app() nos testes)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import install_error_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware
from app.modules import subtitles, system
from app.modules import users as _users  # noqa: F401  (tabela user no metadata; sem rotas)

MODULES = [system, subtitles]


def create_app() -> FastAPI:
    s = get_settings()
    setup_logging(s.LOG_LEVEL, json=s.ENV != "dev")
    app = FastAPI(
        title="LearnWatching API",
        version="1.0.0",
        description="Lista as legendas disponíveis de vídeos do YouTube para o LearnWatching.",
    )
    install_error_handlers(app)
    # Ordem: o último adicionado é o mais externo.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)
    for module in MODULES:
        app.include_router(module.router)
    return app


app = create_app()
