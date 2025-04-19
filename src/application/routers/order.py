from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.models import CartModel
from src.repositories import CartRepository, CartProductRepository, OrderRepository, OrderProductRepository
from src.database import get_db
from src.services.order import OrderService
from ..utils.token_services import TokenService
from .depends import get_cart_repository, get_token_service, get_cart_product_repository, oauth2_scheme, get_order_services
from ..shemas import OrderSchema  # Импортируем схему
router = APIRouter()


# Эндпоинты:
# Добавление товара в корзину
@router.post(
    "/users/order/",
    tags=["Заказ"],
    summary="Создание заказа",
    response_model=OrderSchema,
    status_code=status.HTTP_201_CREATED
)
def create_order(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    order_service: OrderService = Depends(get_order_services),
):

    user_id = token_service.get_user(token)
    created_order = order_service.create(user_id) 

    if not created_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    
    # Преобразуем модель SQLAlchemy в словарь для Pydantic
    return OrderSchema.from_orm(created_order)


# дописать это и написать тест
