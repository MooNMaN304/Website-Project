from sqlalchemy.orm import Session
from typing import List, Optional
from src.models import OrderModel

class OrderRepository:
    def __init__(self, order_model: OrderModel, session: Session):
        self.order_model = order_model
        self.session = session

    def create_order(self, user_id: int) -> OrderModel:
        """Создает новый заказ"""
        order = self.order_model(user_id=user_id, payment=False)
        self.session.add(order)
        self.session.commit()
        self.session.refresh(order)
        return order

    def get_order(self, order_id: int) -> Optional[OrderModel]:
        """Получает заказ по ID"""
        return self.session.query(self.order_model).filter(self.order_model.id == order_id).first()

    def get_user_orders(self, user_id: int) -> List[OrderModel]:
        """Получает все заказы пользователя"""
        return self.session.query(self.order_model).filter(self.order_model.user_id == user_id).all()

    def complete_order(self, order_id: int) -> Optional[OrderModel]:
        """Завершает заказ (помечает как оплаченный)"""
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
