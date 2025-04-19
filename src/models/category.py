from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CategoryModel(AbstractBase):
    __tablename__ = 'categories'
    name = Column(String, unique=True, nullable=False)

    
    
    def __str__(self):
        return str(self.name, self.id)
    
    def __repr__(self):
        return f"CategoryModel('{self.name}', '{self.id}')"
