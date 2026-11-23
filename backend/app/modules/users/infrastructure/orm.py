from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class UserRow(Base):
    """Tabela `user` criada na revisão 1a28ea8eb4a0 (antes em app/infrastructure/db/models.py)."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str | None] = mapped_column(String)
    email: Mapped[str | None] = mapped_column(String)
