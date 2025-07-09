from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CartProductModel(AbstractBase):
    __tablename__ = "carts_products"

    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)

    # Новые поля для вариантов
    variant_id = Column(String)  # ID конкретного варианта (например "color-blue-size-m")
    selected_options = Column(JSON)  # Сохраняем выбранные опции в формате {"Color": "Blue", "Size": "M"}

    # Отношения
    cart_rel = relationship("CartModel", back_populates="cart_product_rel")
    product_rel = relationship("ProductModel")  # Добавляем связь с продуктом для удобства

    def __str__(self):
        options = ", ".join(f"{k}:{v}" for k, v in (self.selected_options or {}).items())
        return f"Cart {self.cart_id}, Product {self.product_id}" + (f" ({options})" if options else "")

    def __repr__(self):
        return (
            f"CartProductModel(cart_id={self.cart_id}, product_id={self.product_id}, "
            f"quantity={self.quantity}, variant_id='{self.variant_id}')"
        )

    @property
    def display_name(self) -> str:
        """Генерирует отображаемое имя с вариантами"""
        if not self.selected_options:
            return self.product_rel.title if self.product_rel else f"Product {self.product_id}"

        options = ", ".join(self.selected_options.values())
        return f"{self.product_rel.title} ({options})" if self.product_rel else f"Product {self.product_id} ({options})"

