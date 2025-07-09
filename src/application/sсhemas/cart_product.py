from datetime import datetime

from pydantic import BaseModel, Field


class SelectedOption(BaseModel):
    name: str
    value: str


class FeaturedImage(BaseModel):
    url: str | None
    altText: str | None


class ProductInfo(BaseModel):
    id: str
    title: str
    handle: str
    featuredImage: FeaturedImage | None


class Merchandise(BaseModel):
    id: str
    title: str
    product: ProductInfo
    selectedOptions: list[SelectedOption]


class CostAmount(BaseModel):
    amount: str
    currencyCode: str


class Cost(BaseModel):
    totalAmount: CostAmount


class CartProductItemSchema(BaseModel):
    id: str
    quantity: int = Field(..., gt=0, le=100)
    cost: Cost
    merchandise: Merchandise


class CartProductRequestSchema(BaseModel):
    product_id: int
    variant_id: str | None = None
    quantity: int = Field(..., gt=0, le=100)


class CartResponseSchema(BaseModel):
    user_id: int
    items: list[CartProductItemSchema]
    total_items: int
    total_price: float
    created_at: datetime
    updated_at: datetime


class CartUpdateResponseSchema(BaseModel):
    success: bool
    message: str
    cart: CartResponseSchema
