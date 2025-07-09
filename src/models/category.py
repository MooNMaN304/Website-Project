from sqlalchemy import Column, String

from .base import AbstractBase


class CategoryModel(AbstractBase):
    __tablename__ = "categories"
    name = Column(String, unique=True, nullable=False)

    def __str__(self):
        return str(self.name, self.id)

    def __repr__(self):
        return f"CategoryModel('{self.name}', '{self.id}')"
