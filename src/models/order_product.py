from sqlalchemy import Column, ForeignKey, Integer

from .base import AbstractBase


class OrderProductModel(AbstractBase):
    __tablename__ = "order_products"
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)  # Добавим количество товаров

    def __repr__(self):
        return (
            f"OrderProductModel(id={self.id}, "
            f"order_id={self.order_id}, "
            f"product_id={self.product_id}, "
            f"quantity={self.quantity})"
        )

    def __str__(self):
        return f"Товар {self.product_id} ({self.quantity})"
