from fastapi import APIRouter, Depends, HTTPException, status

from src.application.logger import logger
from src.exceptions.order_exceptions import CartIsEmpty, OrderNotFoundException
from src.services.order import OrderService

from ..sсhemas import OrderSchema
from ..utils.token_services import TokenService
from .depends import get_order_services, get_token_service, oauth2_scheme

router = APIRouter()


@router.post(
    "/users/order/",
    tags=["Заказ"],
    summary="Создание заказа",
    response_model=OrderSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    order_service: OrderService = Depends(get_order_services),
):
    user_id = token_service.get_user(token)
    logger.info(f"Попытка создать заказ для пользователя {user_id}")

    try:
        created_order = order_service.create(user_id)
        return OrderSchema.from_orm(created_order)
    except CartIsEmpty as e:
        logger.warning(f"Ошибка создания заказа для пользователя {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users/order/{order_id}/", tags=["Заказ"], summary="Получение заказа по ID", response_model=OrderSchema)
def get_order(
    order_id: int,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    order_service: OrderService = Depends(get_order_services),
):
    user_id = token_service.get_user(token)
    logger.info(f"Пользователь {user_id} запрашивает заказ {order_id}")

    try:
        order = order_service.get_order_by_id(order_id)
    except OrderNotFoundException as e:
        logger.warning(str(e))
        raise HTTPException(status_code=404, detail=str(e))

    if order.user_id != user_id:
        logger.warning(f"Доступ к заказу {order_id} запрещён для пользователя {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")

    return OrderSchema.from_orm(order)


@router.get(
    "/users/orders/", tags=["Заказ"], summary="Получение всех заказов пользователя", response_model=list[OrderSchema]
)
def get_user_orders(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    order_service: OrderService = Depends(get_order_services),
):
    user_id = token_service.get_user(token)
    logger.info(f"Получение всех заказов пользователя {user_id}")

    orders = order_service.get_user_orders(user_id)
    return [OrderSchema.from_orm(order) for order in orders]
