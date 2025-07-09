"""Add variant fields to cart products

Revision ID: bf13d5c59024
Revises: 921265bc075f
Create Date: 2025-04-28 00:28:27.910446

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'bf13d5c59024'
down_revision: str | None = '921265bc075f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade():
    # op.add_column('carts_products', sa.Column('variant_id', sa.String(), nullable=True))
    op.add_column('carts_products', sa.Column('selected_options', sa.JSON(), nullable=True))

def downgrade():
    op.drop_column('carts_products', 'selected_options')
    op.drop_column('carts_products', 'variant_id')
