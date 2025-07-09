import random

import pytest
from fastapi import status
from sqlalchemy.orm import Session 

from src.models.user import UserModel
from src.application.sсhemas import UserAuth
from src.application.utils.token_services import TokenService
from src.repositories import UserRepository, CartProductRepository
from src.models import OrderModel, OrderProductModel


def test_create_order(mock_token_service, product_to_cart, test_client, test_session: Session):
    user_id = product_to_cart.cart_rel.user_id
    token = 'some_token'
    response = test_client.post(
        "/api/users/order/",
        headers={"Authorization": f"Bearer {token}"})
    
    assert response.status_code == status.HTTP_201_CREATED
    # получаем созданный ордер
    order: OrderModel = test_session.query(OrderModel).filter(OrderModel.user_id == user_id).first()
    # проверяем что ордер создан
    assert order is not None
    # проверяем что в ордере присуствуют товары из фикстуры
    order_product_model: OrderProductModel = test_session.query(OrderProductModel).filter(OrderProductModel.order_id == order.id).first()
    assert order_product_model.quantity == 4

