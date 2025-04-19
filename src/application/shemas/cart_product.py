from pydantic import BaseModel, Field
from src.application.shemas.product import ProductSchema


# Схема для запроса на добавление товара в корзину !!!
class CartProductResponse(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100, description="Quantity must be between 1 and 100")

    class Config:
        orm_mode = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    products: list[CartProductResponse]
    total_items: int  # Общее количество товаров
    total_price: float  # Общая стоимость
    message: str  # Сообщение об успешном удалении
    
    class Config:
        orm_mode = True
