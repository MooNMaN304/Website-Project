from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session


from src.database import get_db  # Импортируем get_db из database.py
from src.repositories.product import ProductRepository, NotFoundProductException
from src.models.product import ProductModel
from src.application.shemas import ProductSchema, ProductListResponse


router = APIRouter()

# Функция для получения репозитория
def get_product_repository(db: Session = Depends(get_db)) -> ProductRepository:
    return ProductRepository(product_model=ProductModel, session=db)

# Эндпоинты
# Получение одного продукта
@router.get(
    "/products/{product_id}",
    tags=["Продукты"],
    summary="Получить конкретный продукт",
    response_model=ProductSchema
)
def get_product(
    product_id: int,
    product_repository: ProductRepository = Depends(get_product_repository)
):
    try:
        product = product_repository.get(product_id)
    except NotFoundProductException as e:
        raise HTTPException(status_code=404, detail=str(e))

    return ProductSchema(product_id=product.id, 
                         product_name=product.name, 
                         product_price = product.price,
                         product_size = product.size, 
                         product_color = product.color, 
                         product_delivery = product.delivery, 
                         product_raiting = product.raiting,
                         product_description = product.description, 
                         product_image = product.image, 
                         product_category = product.category_id)
