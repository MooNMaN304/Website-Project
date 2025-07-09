"""merge cart variant and X

Revision ID: de40309de281
Revises: bf13d5c59024, ce7f089afaac
Create Date: 2025-06-01 17:31:28.947169

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de40309de281'
down_revision: Union[str, None] = ('bf13d5c59024', 'ce7f089afaac')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
