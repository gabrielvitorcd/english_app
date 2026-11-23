from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.errors import AppError

# Sem tag no router: o /health fica no OpenAPI exatamente como era antes.
router = APIRouter()

# scope="function": a sessão fecha antes de a resposta sair (como no core-studio).
Session = Annotated[AsyncSession, Depends(get_session, scope="function")]


class Health(BaseModel):
    status: str


@router.get("/health", response_model=None)
def estamos_online() -> str:
    # Mesma resposta de antes da mudança de estrutura (a string JSON "ESTAMOS ONLINE!").
    return "ESTAMOS ONLINE!"


@router.get("/ready", response_model=Health, tags=["system"])
async def ready(session: Session) -> Health:
    try:
        await session.execute(text("SELECT 1"))
    except Exception as exc:
        raise AppError("Banco de dados indisponível.") from exc
    return Health(status="ready")
