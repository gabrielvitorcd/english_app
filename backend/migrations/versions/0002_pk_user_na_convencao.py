"""chave primária da tabela user com o nome da naming convention

A revisão 1a28ea8eb4a0 criou a chave primária sem nome. Nos bancos criados antes da naming convention
(app.core.db.NAMING) o Postgres deu o nome padrão `user_pkey`; num banco novo o Alembic já aplica a
convenção e cria `pk_user`. Esta revisão só renomeia, para todos os bancos ficarem iguais. Nenhum dado muda.

Revision ID: 0002
Revises: 1a28ea8eb4a0
Create Date: 2026-11-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "1a28ea8eb4a0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _rename_pk(new: str) -> None:
    current = sa.inspect(op.get_bind()).get_pk_constraint("user")["name"]
    if current and current != new:
        op.execute(sa.text(f'ALTER TABLE "user" RENAME CONSTRAINT "{current}" TO "{new}"'))


def upgrade() -> None:
    _rename_pk("pk_user")


def downgrade() -> None:
    _rename_pk("user_pkey")
