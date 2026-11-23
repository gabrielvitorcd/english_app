"""Usuários. Por enquanto só a tabela `user`, sem rotas nem regras; nada é exportado."""

from app.modules.users.infrastructure import orm as _orm  # noqa: F401  (tabela user no metadata)

__all__: list[str] = []
