"""create backend table

Revision ID: b5321c6b9328
Revises: 
Create Date: 2023-08-01 17:35:06.292360

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b5321c6b9328'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('backend_datasets',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('documents', sa.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('backend_models',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('chains', sa.JSON(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('backend_models')
    op.drop_table('backend_datasets')
    # ### end Alembic commands ###
