# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from src.models.cart_product import CartProductModel
# from src.repositories.cart_product import CartProductRepository
# from src.database import get_db
# from src.application.routers.depends import get_cart_product_repository


# router = APIRouter()


# #Добавления товара в корзину
# # @router.post(
# #         "/carts/{cart_id}/products",
# #         tags=["Продукты в корзине"],
# #         summary="Добавления товара юзером",
# #         #response_model=CartProductSchema
# #         )
# # def add_product_to_cart(
# #     cart_id: int,
# #     product_id: int,
# #     cart_product_repository: CartProductRepository = Depends(get_cart_product_repository)
# # ):
# #     return cart_product_repository.add_product(cart_id=cart_id, product_id=product_id)

# #Получения товаров в корзине
# @router.get(
#         "/carts/{cart_id}/products",
#         tags=["Продукты в корзине"],
#         summary="Получить товары в корзине",
#         #response_model=list[CartProductSchema]
#         )
# def get_products_in_cart(
#     cart_id: int,
#     cart_product_repository: CartProductRepository = Depends(get_cart_product_repository)
# ):
#     return cart_product_repository.get_products_in_cart(cart_id=cart_id)

# #Удаления товара из корзины
# @router.delete(
#         "/carts/{cart_id}/products/{product_id}",
#         tags=["Продукты в корзине"],
#         summary="Удаления товара",
#         )
# def remove_product_from_cart(
#     cart_id: int,
#     product_id: int,
#     cart_product_repository: CartProductRepository = Depends(get_cart_product_repository)
# ):
#     cart_product_repository.remove_product(cart_id=cart_id, product_id=product_id)
#     return {"message": "Product removed from cart"}

# #Стоимость всей корзины
# @router.get(
#     "/carts/{cart_id}/total",
#     tags=["Продукты в корзине"],
#     summary="Получить стоимость всей корзины",
#     #response_model=CartProductSchema
#     )
# def get_cart_total(
#     cart_id: int,
#     cart_product_repository: CartProductRepository = Depends(get_cart_product_repository)
# ):
#     return cart_product_repository.total_cost(cart_id=cart_id)

# #Очистить корзину
# @router.delete(
#         "/carts/{cart_id}/clear",
#         tags=["Продукты в корзине"],
#         summary="Очистить корзину",
#         )
# def clear_cart(
#     cart_id: int,
#     cart_product_repository: CartProductRepository = Depends(get_cart_product_repository)
# ):
#     cart_product_repository.clear_cart(cart_id=cart_id)
#     return {"message": "Cart cleared successfully"}
