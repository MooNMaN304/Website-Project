import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.application.sсhemas import CartProductRequestSchema, CartResponseSchema, CartUpdateResponseSchema
from src.application.utils.token_services import TokenService
from src.repositories.cart import CartRepository
from src.services.cart_product import CartProductService

from .depends import (
    get_cart_product_service,
    get_cart_repository,
    get_token_service,
    oauth2_scheme,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Корзина"])


def build_cart_response(user_id: int, cart_id: int, cart_product_service: CartProductService) -> CartResponseSchema:
    items_models = cart_product_service.cart_product_repo.get_products_in_cart(cart_id=cart_id)
    items = [cart_product_service.serialize_cart_item(cp) for cp in items_models]
    return CartResponseSchema(
        user_id=user_id,
        items=items,
        total_items=cart_product_service.get_total_items(cart_id),
        total_price=cart_product_service.get_total_price(cart_id),
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )


@router.post(
    "/users/carts/items/",
    summary="Добавить товар в корзину",
    response_model=CartResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def add_to_cart(
    item: CartProductRequestSchema,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repo: CartRepository = Depends(get_cart_repository),
    cart_product_service: CartProductService = Depends(get_cart_product_service),
):
    user_id = token_service.get_user(token)
    cart = cart_repo.get_by_user_id(user_id)

    try:
        cart_product_service.cart_product_repo.add_product(
            cart_id=cart.id, product_id=item.product_id, variant_id=item.variant_id, quantity=item.quantity
        )
        logger.info(f"Added product {item.product_id} to cart")
        return build_cart_response(user_id, cart.id, cart_product_service)

    except Exception as e:
        logger.error(f"Failed to add product to cart: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/users/carts/items/{product_id}/", summary="Обновить количество товара", response_model=CartResponseSchema)
def update_cart_item(
    product_id: int,
    quantity: int,
    variant_id: str | None = None,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repo: CartRepository = Depends(get_cart_repository),
    cart_product_service: CartProductService = Depends(get_cart_product_service),
):
    if quantity <= 0 or quantity > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Quantity must be between 1 and 100"
        )

    user_id = token_service.get_user(token)
    cart = cart_repo.get_by_user_id(user_id)

    try:
        cart_product_service.cart_product_repo.change_quantity(
            cart_id=cart.id, product_id=product_id, variant_id=variant_id, quantity=quantity
        )
        logger.info(f"Updated quantity for product {product_id}")
        return build_cart_response(user_id, cart.id, cart_product_service)

    except Exception as e:
        logger.error(f"Failed to update product in cart: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/users/carts/items/{product_id}/", summary="Удалить товар из корзины", response_model=CartUpdateResponseSchema
)
def remove_from_cart(
    product_id: int,
    variant_id: str | None = Query(None),
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repo: CartRepository = Depends(get_cart_repository),
    cart_product_service: CartProductService = Depends(get_cart_product_service),
):
    user_id = token_service.get_user(token)
    cart = cart_repo.get_by_user_id(user_id)

    try:
        cart_product_service.cart_product_repo.remove_product(
            cart_id=cart.id, product_id=product_id, variant_id=variant_id
        )
        logger.info(f"Removed product {product_id} from cart")
        cart_data = build_cart_response(user_id, cart.id, cart_product_service)
        return CartUpdateResponseSchema(success=True, message="Товар успешно удалён из корзины", cart=cart_data)

    except Exception as e:
        logger.error(f"Failed to remove product from cart: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/users/carts/", summary="Получить содержимое корзины", response_model=CartResponseSchema)
def get_cart(
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repo: CartRepository = Depends(get_cart_repository),
    cart_product_service: CartProductService = Depends(get_cart_product_service),
):
    user_id = token_service.get_user(token)
    cart = cart_repo.get_by_user_id(user_id)
    return build_cart_response(user_id, cart.id, cart_product_service)
