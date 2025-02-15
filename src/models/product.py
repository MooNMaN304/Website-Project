import datetime

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class ProductModel(AbstractBase):
    __tablename__ = 'products'
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False)
    size = Column(String, nullable=False)
    color = Column(String, nullable=False)
    delivery = Column(String, nullable=False)
    raiting = Column(Integer, nullable=False)
    decription = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)

    def __str__(self):
        return self.name, self.id, self.price, self.size, self.color, self.delivery, self.raiting, self.decription
    
    def __repr__(self):
        return f"ProductModel('{self.name}', '{self.id}', '{self.price}',
        '{self.size}', '{self.color}', '{self.delivery}', '{self.raiting}', '{self.decription}')"