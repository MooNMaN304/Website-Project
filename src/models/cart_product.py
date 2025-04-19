import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CartProductModel(AbstractBase):
    __tablename__ = 'carts_products'
    cart_id = Column(Integer, ForeignKey('carts.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, default=1)
    
    # Исправленное отношение
    cart_rel = relationship("CartModel", back_populates="cart_product_rel")

    def __str__(self):
        return f"{self.cart_id}, {self.product_id}"
    
    def __repr__(self):
        return f"CartProductModel('{self.cart_id}', '{self.product_id}')"
    
    