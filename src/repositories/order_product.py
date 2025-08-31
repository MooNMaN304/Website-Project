from sqlalchemy.orm import Session

from src.models import OrderProductModel


class OrderProductRepository:
    def __init__(self, order_product_model: OrderProductModel, session: Session):
        self.order_product_model = order_product_model
        self.session = session

    def add_product_to_order(self, order_id: int, product_id: int, quantity: int = 1) -> OrderProductModel:
        """Добавляет товар в заказ"""
        order_product = self.order_product_model(order_id=order_id, product_id=product_id, quantity=quantity)
        self.session.add(order_product)
        self.session.commit()
        self.session.refresh(order_product)
        return order_product

    def remove_product_from_order(self, order_id: int, product_id: int) -> bool:
        """Удаляет товар из заказа"""
        order_product = (
            self.session.query(self.order_product_model)
            .filter(self.order_product_model.order_id == order_id, self.order_product_model.product_id == product_id)
            .first()
        )
        if order_product:
            self.session.delete(order_product)
            self.session.commit()
            return True
        return False

    def get_order_products(self, order_id: int):
        """Получает все товары в заказе с информацией о продуктах"""
        return self.session.query(self.order_product_model).filter(self.order_product_model.order_id == order_id).all()
