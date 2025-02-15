from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .base import AbstractBase


class OrderModel(AbstractBase):
    __tablename__ = 'order'
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    payment = Column(Boolean, nullable=False)

    def __str__(self):
        return self.user_id, self.id, self.product_id, self.payment
    
    def __repr__(self):
        return f"OrderModel('{self.user_id}', '{self.id}', '{self.product_id}', '{self.payment}')"