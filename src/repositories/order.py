from sqlalchemy.orm import Session, joinedload

from src.models import OrderModel, OrderProductModel


class OrderRepository:
    def __init__(self, order_model: OrderModel, session: Session):
        self.order_model = order_model
        self.session = session

    def create_order(
        self,
        user_id: int,
        email: str | None = None,
        shipping_address: dict | None = None,
        payment_method: str | None = None,
    ) -> OrderModel:
        """Создает новый заказ."""
        order = self.order_model(
            user_id=user_id,
            payment=False,
            email=email,
            shipping_address=shipping_address,
            payment_method=payment_method,
        )
        self.session.add(order)
        self.session.commit()
        self.session.refresh(order)
        return order

    def get_order(self, order_id: int) -> OrderModel | None:
        """Получает заказ по ID с продуктами."""
        return (
            self.session.query(self.order_model)
            .options(
                joinedload(self.order_model.order_products).joinedload(OrderProductModel.product),
                joinedload(self.order_model.user),
            )
            .filter(self.order_model.id == order_id)
            .first()
        )

    def get_user_orders(self, user_id: int) -> list[OrderModel]:
        """Получает все заказы пользователя с продуктами."""
        return (
            self.session.query(self.order_model)
            .options(
                joinedload(self.order_model.order_products).joinedload(OrderProductModel.product),
                joinedload(self.order_model.user),
            )
            .filter(self.order_model.user_id == user_id)
            .all()
        )

    def complete_order(self, order_id: int) -> OrderModel | None:
        """Завершает заказ (помечает как оплаченный)."""
        order = self.get_order(order_id)
        if order:
            order.payment = True
            self.session.commit()
            self.session.refresh(order)
            return order
        return None

    # def delete_order(self, order_id: int) -> bool:
    #     """Удаляет заказ и все связанные с ним товары"""
    #     order = self.get_order(order_id)
    #     if order:
    #         self.session.delete(order)
    #         self.session.commit()
    #         return True
    #     return False
