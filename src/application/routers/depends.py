from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.application.utils.token_services import TokenService
from src.config import SETTINGS
from src.database import get_db  # Импортируем get_db из database.py
from src.models import CartModel, OrderModel, OrderProductModel, ReviewModel, UserModel
from src.repositories import (
    CartProductRepository,
    CartRepository,
    OrderProductRepository,
    OrderRepository,
    ProductAdapter,
    ProductRepository,
    ReviewRepository,
)
from src.repositories.user import UserRepository
from src.services.cart_product import CartProductService
from src.services.order import OrderService
from src.services.product import ProductService
from src.services.user import UserService


def get_user_repository(db: Session = Depends(get_db)):
    return UserRepository(user_model=UserModel, session=db)


def get_cart_repository(db: Session = Depends(get_db)):
    return CartRepository(cart_model=CartModel, session=db)


def get_cart_product_repository(db: Session = Depends(get_db)) -> CartProductRepository:
    return CartProductRepository(session=db)


def get_product_repository(db: Session = Depends(get_db)) -> ProductRepository:
    return ProductRepository(session=db)


def get_review_repository(db: Session = Depends(get_db)) -> ReviewRepository:
    return ReviewRepository(review_model=ReviewModel, session=db)


def get_product_adapter(
    product_repository: ProductRepository = Depends(get_product_repository),
    review_repository: ReviewRepository = Depends(get_review_repository),
) -> ProductAdapter:
    return ProductAdapter(product_repository=product_repository, review_repo=review_repository)


def get_order_repository(db: Session = Depends(get_db)) -> OrderRepository:
    return OrderRepository(order_model=OrderModel, session=db)


def get_order_product_repository(db: Session = Depends(get_db)) -> OrderProductRepository:
    return OrderProductRepository(order_product_model=OrderProductModel, session=db)


def get_token_service() -> TokenService:
    return TokenService(secret_key=SETTINGS.secret_key)


def get_product_service(
    product_repository: ProductRepository = Depends(get_product_repository),
    review_repository: ReviewRepository = Depends(get_review_repository),
) -> ProductService:
    return ProductService(product_repository, review_repository)


def get_cart_product_service(
    cart_repository: CartRepository = Depends(get_cart_repository),
    cart_product_repository: CartProductRepository = Depends(get_cart_product_repository),
) -> CartProductService:
    return CartProductService(
        cart_repository=cart_repository,
        cart_product_repository=cart_product_repository,
    )


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
    cart_repository: CartRepository = Depends(get_cart_repository),
):
    return OrderService(
        order_repository=order_repository,
        order_product_repository=order_product_repository,
        cart_repository=cart_repository,
    )
