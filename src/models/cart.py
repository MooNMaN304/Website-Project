from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CartModel(AbstractBase):
    __tablename__ = "carts"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cart_product_rel = relationship("CartProductModel", back_populates="cart_rel", cascade="all, delete-orphan")

    def __str__(self):
        return str(self.user_id)

    def __repr__(self):
        return f"CartModel('{self.user_id}')"
