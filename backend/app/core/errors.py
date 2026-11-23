"""Erros da aplicação e respostas no formato Problem Details (RFC 9457).

Diferente do core-studio, só o AppError ganha o formato Problem Details: o HTTPException e os erros de
validação (422) continuam com a resposta padrão do FastAPI (`{"detail": ...}`), que é o que a API já
devolvia antes da mudança de estrutura.
"""

from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

PROBLEM_JSON = "application/problem+json"


class AppError(Exception):
    """Erro esperado, com mensagem pronta para mostrar ao usuário (em português)."""

    status: int = 400
    title: str = "Requisição inválida"
    type: str = "about:blank"

    def __init__(self, detail: str = "", **extra: Any) -> None:
        super().__init__(detail or self.title)
        self.detail = detail or self.title
        self.extra = extra


class NotFound(AppError):
    status = 404
    title = "Não encontrado"


class Conflict(AppError):
    status = 409
    title = "Conflito"


def problem(
    status: int, title: str, detail: str, instance: str, type_: str = "about:blank", **extra: Any
) -> JSONResponse:
    body = {"type": type_, "title": title, "status": status, "detail": detail, "instance": instance, **extra}
    return JSONResponse(body, status_code=status, media_type=PROBLEM_JSON)


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(request: Request, exc: AppError) -> JSONResponse:
        return problem(exc.status, exc.title, exc.detail, request.url.path, exc.type, **exc.extra)
