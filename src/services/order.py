from src.repositories.order import OrderRepository
from src.repositories.order_product import OrderProductRepository
from typing import Any

from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from typing import Optional
from sqlalchemy.orm import Session
from typing import List, Optional
from src.models import OrderModel, OrderProductModel
from src.repositories.cart import CartRepository

class CartIsEmpty(Exception):
    pass


class OrderService:
    def __init__(self, 
                 order_product_repository: OrderProductRepository, 
                 order_repository: OrderRepository, 
                 cart_repository: CartRepository):
        
        self.order_repository = order_repository
        self.order_product = order_product_repository
        self.cart_repository = cart_repository

    def create(self, user_id: int) -> OrderModel:
        cart = self.cart_repository.get_by_user_id(user_id)
        if len(cart.cart_product_rel) == 0:
            raise CartIsEmpty
        
        order = self.order_repository.create_order(user_id)
        
        for product in cart.cart_product_rel:
            self.order_product.add_product_to_order(order_id=order.id, 
                                                    product_id=product.product_id, 
                                                    quantity=product.quantity)
            
        return order

