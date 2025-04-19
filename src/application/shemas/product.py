from pydantic import BaseModel, Field
from typing import Optional

class ProductSchema(BaseModel):
    product_id: int
    product_name: str = Field(max_length=100)
    product_price: float = Field(ge=0, description="Цена продукта должна быть неотрицательной")
    product_size: Optional[str] = Field(max_length=30, default=None)
    product_color: Optional[str] = Field(max_length=30, default=None)
    product_delivery: Optional[str] = Field(max_length=300, default=None)
    product_rating: float = Field(ge=0, le=5, description="Рейтинг продукта должен быть от 0 до 5")
    product_description: Optional[str] = Field(max_length=500, default=None)
    product_image: str = Field(description="Ссылка на изображение продукта")
    product_category: int = Field(description="ID категории продукта")

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: list[ProductSchema]
