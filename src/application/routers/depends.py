from fastapi import APIRouter, Query, HTTPException, Depends, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated

from src.database import get_db  # Импортируем get_db из database.py
from src.repositories.user import UserRepository, NotFoundUserException
from src.models import UserModel, CartModel, ProductModel, CartProductModel, ReviewModel, OrderModel, OrderProductModel
from src.repositories import ReviewRepository, ProductRepository, CartRepository, CartProductRepository, OrderRepository, OrderProductRepository
from src.services.user import UserService
from src.services.order import OrderService
from src.application.utils.token_services import TokenService
from src.config import SETTINGS


def get_user_repository(db: Session = Depends(get_db)):
    return UserRepository(user_model=UserModel, session=db)


def get_cart_repository(db: Session = Depends(get_db)):
    return CartRepository(cart_model=CartModel, session=db)


def get_cart_product_repository(db: Session = Depends(get_db)) -> CartProductRepository:
    return CartProductRepository(cart_product_model=CartProductModel, session=db)


def get_product_repository(db: Session = Depends(get_db)) -> ProductRepository:
    return ProductRepository(product_model=ProductModel, session=db)


def get_review_repository(db: Session = Depends(get_db)) -> ReviewRepository:
    return ReviewRepository(review_model=ReviewModel, session=db)


def get_order_repository(db: Session = Depends(get_db)) -> OrderRepository:
    return OrderRepository(order_model=OrderModel, session=db)


def get_order_product_repository(db: Session = Depends(get_db)) -> OrderProductRepository:
    return OrderProductRepository(order_product_model=OrderProductModel, session=db)


def get_token_service() -> TokenService:
    return TokenService(secret_key=SETTINGS.secret_key)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user_services(
    user_repository: UserRepository = Depends(get_user_repository),
    cart_repository: CartRepository = Depends(get_cart_repository),
    token_service: TokenService = Depends(get_token_service),
):
    return UserService(user_repository, cart_repository, token_service)


def get_order_services(
    order_repository: OrderRepository = Depends(get_order_repository),
    order_product_repository: OrderProductRepository = Depends(get_order_product_repository),
    cart_repository: CartRepository = Depends(get_cart_repository)
):
    return OrderService(order_repository=order_repository, order_product_repository=order_product_repository, cart_repository=cart_repository)