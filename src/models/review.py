from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .base import AbstractBase


class RewiesModel(AbstractBase):
    __tablename__ = 'reviews'
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)

    def __str__(self):
        return self.user_id, self.id, self.product_id
    
    def __repr__(self):
        return f"RewiesModel('{self.user_id}', '{self.id}', '{self.product_id}')"