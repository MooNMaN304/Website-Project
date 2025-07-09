from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SelectedOptionSchema(BaseModel):
    name: str
    value: str


class MoneySchema(BaseModel):
    amount: str
    currencyCode: str


class ProductVariantNodeSchema(BaseModel):
    id: str
    availableForSale: bool
    selectedOptions: list[SelectedOptionSchema]
    price: MoneySchema


class VariantEdgeSchema(BaseModel):
    node: ProductVariantNodeSchema


class ProductImageNodeSchema(BaseModel):
    url: str
    altText: str | None = None
    width: int | None = None
    height: int | None = None


class ImageEdgeSchema(BaseModel):
    node: ProductImageNodeSchema


class ProductOptionSchema(BaseModel):
    id: str
    name: str
    values: list[str]


class SeoSchema(BaseModel):
    title: str
    description: str


class PriceRangeSchema(BaseModel):
    minVariantPrice: MoneySchema
    maxVariantPrice: MoneySchema


class ProductBaseSchema(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    descriptionHtml: str | None = None
    handle: str | None = None


class ProductCreateSchema(ProductBaseSchema):
    price: float = Field(..., ge=0)
    options: list[ProductOptionSchema]
    tags: list[str] = []


class ProductResponseSchema(ProductBaseSchema):
    id: str  # Изменено на str для формата "product-{id}"
    availableForSale: bool
    priceRange: PriceRangeSchema
    options: list[ProductOptionSchema]
    variants: dict[str, list[VariantEdgeSchema]]  # GraphQL-style с edges
    featuredImage: ProductImageNodeSchema
    images: dict[str, list[ImageEdgeSchema]]  # GraphQL-style с edges
    seo: SeoSchema
    tags: list[str]
    updatedAt: datetime
    rating: float = Field(ge=0, le=5, default=0.0)
    # categoryId: int  # camelCase для единообразия

    model_config = ConfigDict(from_attributes=True)  # Для Pydantic v2


class ProductListResponseSchema(BaseModel):
    edges: list[dict[str, ProductResponseSchema]]  # GraphQL-style
    # Или для REST-style:
    # products: List[ProductResponseSchema]


# from pydantic import BaseModel, Field
# from typing import List, Optional
# from datetime import datetime

# class ProductOptionSchema(BaseModel):
#     id: str
#     name: str
#     values: List[str]

# class ProductVariantSchema(BaseModel):
#     id: str
#     available_for_sale: bool
#     selectedOptions: List[dict]
#     price: dict

# class ProductImageSchema(BaseModel):
#     url: str
#     altText: Optional[str] = None
#     width: Optional[int] = None
#     height: Optional[int] = None

# class ProductBaseSchema(BaseModel):
#     title: str = Field(..., max_length=100)
#     description: str
#     descriptionHtml: Optional[str] = None
#     handle: Optional[str] = None

# class ProductCreateSchema(ProductBaseSchema):
#     price: float = Field(..., ge=0)
#     options: List[ProductOptionSchema]
#     tags: List[str] = []

# class ProductResponseSchema(ProductBaseSchema):
#     id: int
#     available_for_sale: bool
#     priceRange: dict
#     variants: List[ProductVariantSchema]
#     featured_image: ProductImageSchema
#     images: List[ProductImageSchema]
#     seo: dict
#     tags: List[str]
#     updatedAt: datetime
#     rating: float = Field(ge=0, le=5, default=0.0)
#     category_id: int

#     class Config:
#         from_attributes = True

# class ProductListResponseSchema(BaseModel):
#     products: List[ProductResponseSchema]

# #-------------------

# # class VariantEdge(BaseModel):
# #     node: ProductVariantSchema

# # class ProductModel(BaseModel):
# #     variants: list[VariantEdge]
# #     images: list[ProductImageSchema]
