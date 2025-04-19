import datetime

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase

class ProductModel(AbstractBase):
    __tablename__ = 'products'
    name = Column(String, unique=False, nullable=False)
    price = Column(Float, nullable=False)
    size = Column(String, nullable=True)
    color = Column(String, nullable=True)
    delivery = Column(String, nullable=True)
    description = Column(String, nullable=True)
    image = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)

    rating = relationship("ReviewModel", backref="product", cascade="all, delete-orphan")
    

    def __str__(self):
        return str(self.name, self.id, self.price, self.size, self.color, self.delivery, self.description)
    
    def __repr__(self):
        return f"""ProductModel('{self.name}', '{self.id}', '{self.price}', '{self.size}',
         '{self.color}', '{self.delivery}', '{self.description}')"""
