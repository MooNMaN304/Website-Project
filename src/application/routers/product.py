from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.application.logger import logger
from src.application.sсhemas import ProductListResponseSchema, ProductResponseSchema
from src.exceptions.product_exceptions import (
    NotFoundProductException,
    ProductListException,
    RecommendationException,
)
from src.repositories import ReviewRepository
from src.repositories.product import ProductAdapter, ProductRepository
from src.services.product import ProductService

from .depends import get_product_adapter, get_product_repository, get_product_service, get_review_repository

router = APIRouter(tags=["Продукты"])


@router.get("/products/{product_id}", summary="Получить конкретный продукт", response_model=ProductResponseSchema)
def get_product(product_id: int, product_adpater: ProductAdapter = Depends(get_product_adapter)):
    try:
        product = product_adpater.get_one_product(product_id)
        logger.info(f"Продукт {product_id} успешно получен")
        return product
    except NotFoundProductException as e:
        logger.warning(f"Продукт с ID {product_id} не найден: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/products", summary="Получить список продуктов", response_model=ProductListResponseSchema)
def get_products(
    page: int = Query(1, gt=0),
    count: int = Query(10, gt=0, le=100),
    product_adpater: ProductAdapter = Depends(get_product_adapter),
):
    try:
        result = product_adpater.get_products(page=page, count=count)
        logger.info(f"Список продуктов успешно получен: страница {page}, количество {count}")
        return result
    except ProductListException as e:
        logger.warning(f"Ошибка получения списка продуктов: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/category/{category_id}", summary="Получить продукты по категории", response_model=ProductListResponseSchema
)
def get_products_by_category(
    category_id: int,
    page: int = Query(1, gt=0),
    count: int = Query(10, gt=0, le=100),
    product_repo: ProductRepository = Depends(get_product_repository),
    review_repo: ReviewRepository = Depends(get_review_repository),
):

    products = product_repo.get_by_category(category_id, page, count)
    products_with_rating = [
        {**product.__dict__, "rating": review_repo.calculate_rating(product.id)} for product in products
    ]
    logger.info(f"Получены продукты по категории {category_id}")
    return {"products": products_with_rating}


@router.get(
    "/products/{product_id}/recommendations",
    summary="Получить рекомендованные продукты",
    response_model=ProductListResponseSchema,
)
def get_recommendations(product_id: int, product_service: ProductService = Depends(get_product_service)):
    try:
        recommended_products = product_service.get_products_recommendation(product_id)
        logger.info(f"Рекомендации успешно получены для продукта {product_id}")
        return {"edges": recommended_products}
    except RecommendationException as e:
        logger.warning(f"Ошибка рекомендаций для продукта {product_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
