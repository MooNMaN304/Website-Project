from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .base import AbstractBase


class OrderProductModel(AbstractBase):
    __tablename__ = 'order_product'
    order_id = Column(Integer, ForeignKey('order.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)


    def __str__(self):
        return self.order_id, self.product_id
    
    def __repr__(self):
        return f"OrderProductModel('{self.order_id}', '{self.product_id})"