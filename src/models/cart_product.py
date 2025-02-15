import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CartProductModel(AbstractBase):
    __tablename__ = 'carts_products'
    cart_id = Column(Integer, ForeignKey('cart.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)


    def __str__(self):
        return self.cart_id, self.product_id
    
    def __repr__(self):
        return f"CartProductModel('{self.cart_id}', '{self.product_id})"