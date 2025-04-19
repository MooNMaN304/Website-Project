from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session


from src.database import get_db  # Импортируем get_db из database.py
from src.repositories.product import ProductRepository, NotFoundProductException
from src.repositories import ReviewRepository
from src.models import ProductModel
from src.application.shemas import ProductSchema, ProductListResponse, ReviewSchema, ReviewResponce
from src.application.utils.token_services import TokenService
from .depends import get_product_repository, get_review_repository, get_token_service, get_review_repository, oauth2_scheme


router = APIRouter()


@router.get(
    "/products/{product_id}",
    tags=["Продукты"],
    summary="Получить конкретный продукт",
    response_model=ProductSchema
)
def get_product(
    product_id: int,
    product_repository: ProductRepository = Depends(get_product_repository),
    review_repository: ReviewRepository = Depends(get_review_repository)
):
    try:
        product = product_repository.get(product_id)
        product_rating = review_repository.calculate_rating(product_id)
        
    except NotFoundProductException as e:
        raise HTTPException(status_code=404, detail=str(e))

    return ProductSchema(product_id=product.id, 
                         product_name=product.name, 
                         product_price = product.price,
                         product_size = product.size, 
                         product_color = product.color, 
                         product_delivery = product.delivery, 
                         product_rating = product_rating,
                         product_description = product.description, 
                         product_image = product.image, 
                         product_category = product.category_id)

# Получение всех продуктов
@router.get(
    "/products/",
    tags=["Продукты"],
    summary="Получить все продукты",
    response_model=ProductListResponse
)
def get_products(
    page: int = Query(gt=0, description="Номер страницы"),
    product_repository: ProductRepository = Depends(get_product_repository),
    review_repository: ReviewRepository = Depends(get_review_repository)
):
    products = product_repository.get_all(page=page)
    products_schema = []
    for product in products:
        product_rating = review_repository.calculate_rating(product.id) 
        schema = ProductSchema(product_id=product.id, 
                         product_name=product.name, 
                         product_price = product.price,
                         product_size = product.size, 
                         product_color = product.color, 
                         product_delivery = product.delivery,
                         product_rating = product_rating, 
                         product_description = product.description, 
                         product_image = product.image, 
                         product_category = product.category_id)
        products_schema.append(schema)
    return ProductListResponse(products=products_schema)
        
# # Получение всех продуктов по возрастанию цены
# @router.get(
#     "/products/",
#     tags=["Продукты"],
#     summary="Получить все продукты по возрастанию цены",
#     response_model=ProductListResponse
# )
# def get_products_by_price_ascending(
#     page: int = Query(gt=0, description="Номер страницы"),
#     product_repository: ProductRepository = Depends(get_product_repository)
# ):
#     products = product_repository.get_products_by_price_ascending(page=page):
#     products_schema = []
#     for product in products:
#         schema = ProductSchema(product_id=product.id, 
#                          product_name=product.name, 
#                          product_price = product.price,
#                          product_size = product.size, 
#                          product_color = product.color, 
#                          product_delivery = product.delivery,
#                          #product_rating = product_rating, 
#                          product_description = product.description, 
#                          product_image = product.image, 
#                          product_category = product.category_id)
#         products_schema.append(schema)
#     return ProductListResponse(products=products_schema)

# # Получение продуктов по категории
# @router.get(
#     "/products/",
#     tags=["Продукты"],
#     summary="Получение продуктов по категории",
#     response_model=ProductListResponse
# )
# def get_products_by_category(
#     page: int = Query(gt=0, description="Номер страницы"),
#     product_repository: ProductRepository = Depends(get_product_repository)
# ):
#     products = product_repository.get_products_by_category(page=page):
#     products_schema = []
#     for product in products:
#         schema = ProductSchema(product_id=product.id, 
#                          product_name=product.name, 
#                          product_price = product.price,
#                          product_size = product.size, 
#                          product_color = product.color, 
#                          product_delivery = product.delivery,
#                          #product_rating = product_rating, 
#                          product_description = product.description, 
#                          product_image = product.image, 
#                          product_category = product.category_id)
#         products_schema.append(schema)
#     return ProductListResponse(products=products_schema)

#Удаление продукта
@router.delete(
    "/products/{product_id}",
    tags=["Продукты"],
    summary="Удалить продукт"
)
def delete_product(
    product_id: int,
    product_repository: ProductRepository = Depends(get_product_repository)
):
    product_repository.delete(product_id)
    return {"message": "Product deleted"}


# Оценка продукта
@router.post(
    "/products/{product_id}/reviews",
    tags=["Создает отзыв для товара"],
    response_model=ReviewResponce,
    status_code=201
)
def create_review(
    product_id: int,
    review: ReviewSchema,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    review_repository: ReviewRepository = Depends(get_review_repository)
    ):
    user_id = token_service.get_user(token)
    create_review = review_repository.create_review(user_id, product_id, review.rating)
    return ReviewResponce(
        review_id=create_review.id,
        product_id=create_review.product_id,
        rating=create_review.rating)

# Изменение оценки
@router.put(
    "/products/{product_id}/reviews",
    tags=["Обновление оценки товара"],
    response_model=ReviewResponce,
    status_code=200
)
def update_review(
    product_id: int,
    review: ReviewSchema,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    review_repository: ReviewRepository = Depends(get_review_repository)
    ):
    user_id = token_service.get_user(token)
    review_id = review_repository.get_review_id_by_user_id_and_product_id(user_id, product_id).id
    update_review = review_repository.update_review(review_id, review.rating)
    return ReviewResponce(
        review_id=update_review.id,
        product_id=update_review.product_id,
        rating=update_review.rating)

# Удаление оценки
@router.delete(
    "/products/{product_id}/reviews",
    tags=["Удаление оценки товара"],
    status_code=204
)
def delete_review(
    product_id: int,
    token: str = Depends(oauth2_scheme),
    token_service: TokenService = Depends(get_token_service),
    review_repository: ReviewRepository = Depends(get_review_repository)
    ):
    user_id = token_service.get_user(token)
    review_id = review_repository.get_review_id_by_user_id_and_product_id(user_id, product_id).id
    review_repository.delete_review(review_id)
    return {"message": "Оценка удалена"}
