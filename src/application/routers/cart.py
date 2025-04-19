from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from src.models.cart import CartModel
from src.repositories.cart import CartRepository
from src.repositories.cart_product import CartProductRepository
from src.database import get_db
from src.services.user import UserService
from src.application.utils.token_services import TokenService
from src.application.routers.depends import get_cart_repository, get_token_service, get_cart_product_repository
from ..shemas import CartResponse, CartProductResponse  # Импортируем схему
from .depends import oauth2_scheme 


router = APIRouter()


# Добавление товара в корзину
@router.post(
    "/users/carts/",
    tags=["Корзина"],
    summary="Добавление товара в корзину юзером",
    response_model=CartProductResponse,  # Указываем схему ответа
    status_code=status.HTTP_201_CREATED
)
def add_product_to_cart(
    request: CartProductResponse,
    token: str = Depends(oauth2_scheme), # Токен извлекается из заголовка
    token_service: TokenService = Depends(get_token_service),
    cart_repository: CartRepository = Depends(get_cart_repository),
    cart_product_repository: CartProductRepository = Depends(get_cart_product_repository),
):
# 1. Получаем ID пользователя из токена
#--------------------------------------
    user_id = token_service.get_user(token)
    #этот код есть в функции
    # if not user_id:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid token")

    # Получаем корзину пользователя
    cart = cart_repository.get_by_user_id(user_id)
    #этот код есть в функции
    # if not cart:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="Cart not found")

    # Добавляем товар в корзину
    try:
        cart_product = cart_product_repository.add_product(
            cart_id=cart.id,
            product_id=request.product_id,
            quantity=request.quantity)
        return CartProductResponse(
            message="Продукт успешно добавлен в корзину",
            product_id=cart_product.product_id,
            quantity=cart_product.quantity) # Возвращаем корзину с обновленными данными
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)) from e

# 2. Удаляем продукт из корзины полностью
#----------------------------------------  
@router.delete(
    "/users/carts/products/{product_id}/",
    tags=["Корзина"],
    summary="Удаление товара из корзины юзером",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK
)
def delete_product_from_cart(
    product_id: int,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repository: CartRepository = Depends(get_cart_repository),
    cart_product_repository: CartProductRepository = Depends(get_cart_product_repository),
):
    user_id = token_service.get_user(token)
    
    cart = cart_repository.get_by_user_id(user_id)
    
    try:
        cart_product_repository.remove_product(cart_id=cart.id, product_id=product_id)

        # Получаем обновленный список продуктов в корзине после удаления
        updated_products = cart_product_repository.get_products_in_cart(cart.id)
        
        # Подсчитываем общее количество товаров и общую стоимость
        total_items = len(updated_products)
        total_price = sum(product.price * product.quantity for product in updated_products)
        # return CartResponse(message="Product removed successfully", product_id=product_id)
        return CartResponse(
            id=cart.id,
            user_id=user_id,
            products=[CartProductResponse(product_id=prod.product_id, quantity=prod.quantity) for prod in updated_products],
            total_items=total_items,
            total_price=total_price,
            message="Товар успешно удален из корзины"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)) from e
    
# 3. Меняем колличества товара в корзине
#---------------------------------------
@router.put(
    "/users/carts/products/{product_id}/",
    tags=["Корзина"],
    summary="Изменение количества товара в корзине",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK
    )
def change_product_quantity_in_cart(
    product_id: int,
    quantity: int,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    cart_repository: CartRepository = Depends(get_cart_repository),
    cart_product_repository: CartProductRepository = Depends(get_cart_product_repository),
    ):

    user_id = token_service.get_user(token)
    
     # Получаем корзину пользователя
    cart = cart_repository.get_by_user_id(user_id)
    
    #меняем колличества товаров
    try:
        cart_product_repository.change_quantity(cart_id=cart.id, product_id=product_id, quantity=quantity)
        return CartResponse(message="Product moved successfully", product_id=product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)) from e

# 4. 