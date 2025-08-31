from datetime import datetime

from sqlalchemy import Float
from sqlalchemy.orm import Session

from src.application.logger import logger
from src.exceptions.product_exceptions import NotFoundProductException
from src.models import ProductModel


class ProductRepository:
    def __init__(self, session: Session):
        self.session = session

    def get(self, product_id: int) -> ProductModel:
        product = self.session.get(ProductModel, product_id)
        if not product:
            raise NotFoundProductException(f"Product with ID={product_id} not found")
        return product

    def get_all(self, page: int = 1, count: int = 10) -> list[ProductModel]:
        offset = (page - 1) * count
        return self.session.query(ProductModel).offset(offset).limit(count).all()

    def get_all_prod(self, count: int = 100, exclude_id: int | None = None) -> list[ProductModel]:
        query = self.session.query(ProductModel)
        if exclude_id is not None:
            query = query.filter(ProductModel.id != exclude_id)
        return query.limit(count).all()

    def create(
        self,
        adapter: "ProductAdapter",
        title: str,
        price: float,
        description: str,
        category_id: int,
        options: dict[str, list[str]] | None = None,
        images: list[str] | None = None,
        available_for_sale: bool = True,
        **kwargs,
    ) -> ProductModel:
        try:
            # Основное изображение
            featured_image = (
                {"url": kwargs.get("image_url", ""), "altText": title, "width": 800, "height": 800}
                if kwargs.get("image_url")
                else None
            )

            # Создаем продукт
            product = ProductModel(
                title=title,
                description=description,
                description_html=f"<p>{description}</p>",
                handle=kwargs.get("handle", title.lower().replace(" ", "-")),
                price_range={
                    "minVariantPrice": {"amount": str(price), "currencyCode": "USD"},
                    "maxVariantPrice": {"amount": str(price), "currencyCode": "USD"},
                },
                variants=adapter._build_variants(options or {}, price),
                featured_image=featured_image,
                images=[{"url": img, "altText": title} for img in images] if images else [],
                available_for_sale=available_for_sale,
                seo={"title": title, "description": description},
                tags=kwargs.get("tags", []),
                category_id=category_id,
            )

            self.session.add(product)
            self.session.commit()
            self.session.refresh(product)
            logger.info(f"Создан новый продукт: {title} (ID: {product.id})")
            return product
        except Exception as e:
            logger.error(f"Ошибка при создании продукта {title}: {str(e)}")
            raise

    def update(self, product_id: int, **kwargs) -> ProductModel:
        try:
            product = self.get(product_id)

            # Обновляем только переданные поля
            for key, value in kwargs.items():
                if hasattr(product, key):
                    setattr(product, key, value)
                elif key == "price":
                    product.price_range = {
                        "minVariantPrice": {"amount": str(value), "currencyCode": "USD"},
                        "maxVariantPrice": {"amount": str(value), "currencyCode": "USD"},
                    }

            self.session.commit()
            self.session.refresh(product)
            logger.info(f"Обновлен продукт ID {product_id}: {product.title}")
            return product
        except Exception as e:
            logger.error(f"Ошибка при обновлении продукта {product_id}: {str(e)}")
            raise

    def get_products_by_category(self, category_id: int) -> list[ProductModel]:
        return self.session.query(ProductModel).filter_by(category_id=category_id).all()

    def get_products_by_price_ascending(self) -> list[ProductModel]:
        return (
            self.session.query(ProductModel)
            .order_by(ProductModel.price_range["minVariantPrice"]["amount"].astext.cast(Float).asc())
            .all()
        )

    def delete(self, product_id: int) -> None:
        try:
            product = self.get(product_id)
            product_title = product.title  # Сохраняем название до удаления
            self.session.delete(product)
            self.session.commit()
            logger.info(f"Удален продукт: {product_title} (ID: {product_id})")
        except Exception as e:
            logger.error(f"Ошибка при удалении продукта {product_id}: {str(e)}")
            raise


class ProductAdapter:
    """Форматирует ответ в GraphQL-подобный формат"""

    def __init__(self, product_repository: ProductRepository, review_repo: "ReviewRepository"):
        self.product_repository = product_repository
        self.review_repo = review_repo

    def get_one_product(self, product_id):
        product = self.product_repository.get(product_id)
        review = self.review_repo.calculate_rating(product.id)
        return self._to_graphql_format(product=product, rating=review)

    def get_products(self, page: int = 1, count: int = 10) -> dict:
        products = self.product_repository.get_all(page, count)
        return {"edges": [{"node": self._to_graphql_format(product)} for product in products]}

    def _build_variants(self, options: dict[str, list[str]], price: float) -> list[dict]:
        """Создает варианты на основе опций"""
        variants = []
        if "Size" in options and "Color" in options:
            for size in options["Size"]:
                for color in options["Color"]:
                    variants.append(
                        {
                            "id": f"variant-{size}-{color}",
                            "availableForSale": True,
                            "selectedOptions": [{"name": "Size", "value": size}, {"name": "Color", "value": color}],
                            "price": {"amount": str(price), "currencyCode": "USD"},
                        }
                    )
        return variants

    def _convert_price_range(self, price_range):
        """Convert snake_case price_range from database to camelCase for schema."""
        if not price_range:
            return {
                "maxVariantPrice": {"amount": "0.00", "currencyCode": "USD"},
                "minVariantPrice": {"amount": "0.00", "currencyCode": "USD"},
            }

        # Convert snake_case to camelCase
        converted = {}
        if "min_variant_price" in price_range:
            converted["minVariantPrice"] = self._convert_price_to_money_schema(price_range["min_variant_price"])
        if "max_variant_price" in price_range:
            converted["maxVariantPrice"] = self._convert_price_to_money_schema(price_range["max_variant_price"])

        # If the price_range is already in camelCase (fallback)
        if "minVariantPrice" in price_range:
            converted["minVariantPrice"] = self._convert_price_to_money_schema(price_range["minVariantPrice"])
        if "maxVariantPrice" in price_range:
            converted["maxVariantPrice"] = self._convert_price_to_money_schema(price_range["maxVariantPrice"])

        # Ensure we have both fields
        if "minVariantPrice" not in converted:
            converted["minVariantPrice"] = {"amount": "0.00", "currencyCode": "USD"}
        if "maxVariantPrice" not in converted:
            converted["maxVariantPrice"] = {"amount": "0.00", "currencyCode": "USD"}

        return converted

    def _convert_price_to_money_schema(self, price):
        """Convert price to MoneySchema format."""
        if isinstance(price, dict):
            # If it's already a dict, ensure it has the right structure
            if "amount" in price and "currencyCode" in price:
                return price
            if "amount" in price and "currency_code" in price:
                return {"amount": str(price["amount"]), "currencyCode": price["currency_code"]}
            return {"amount": "0.00", "currencyCode": "USD"}
        if isinstance(price, (int, float, str)):
            # If it's a simple value, wrap it in MoneySchema format
            return {"amount": str(price), "currencyCode": "USD"}
        return {"amount": "0.00", "currencyCode": "USD"}

    def _to_graphql_format(self, product: ProductModel, rating: float = 0.0) -> dict:
        # Извлекаем уникальные опции из вариантов
        options = self._extract_options_from_variants(product.variants)

        return {
            "id": f"product-{product.id}",
            "handle": product.handle,
            "availableForSale": product.available_for_sale,
            "title": product.title,
            "description": product.description,
            "descriptionHtml": product.description_html or f"<p>{product.description}</p>",
            "options": [
                {"id": f"option-{i + 1}", "name": name, "values": values}
                for i, (name, values) in enumerate(options.items())
            ],
            "priceRange": self._convert_price_range(product.price_range),
            "variants": {
                "edges": [
                    {
                        "node": {
                            "id": variant.get("id", f"variant-{i}"),
                            "availableForSale": variant.get("availableForSale", True),
                            "selectedOptions": variant.get("selectedOptions", []),
                            "price": self._convert_price_to_money_schema(variant.get("price", "0.00")),
                        }
                    }
                    for i, variant in enumerate(product.variants or [])
                ]
            },
            "featuredImage": {
                "url": product.featured_image.get("url") if product.featured_image else "",
                "altText": product.featured_image.get("altText", product.title)
                if product.featured_image
                else product.title,
                "width": product.featured_image.get("width", 800) if product.featured_image else 800,
                "height": product.featured_image.get("height", 800) if product.featured_image else 800,
            },
            "images": {
                "edges": [
                    {
                        "node": {
                            "url": img.get("url", ""),
                            "altText": img.get("altText", product.title),
                            "width": img.get("width", 800),
                            "height": img.get("height", 800),
                        }
                    }
                    for img in product.images or []
                ]
            },
            "seo": product.seo or {"title": product.title, "description": product.description},
            "tags": product.tags or [],
            "updatedAt": product.updated_at.isoformat() if product.updated_at else datetime.now().isoformat(),
            "rating": rating,
        }

    def _extract_options_from_variants(self, variants: list[dict]) -> dict[str, list[str]]:
        """Извлекает уникальные опции из списка вариантов"""
        options = {}

        for variant in variants or []:
            for option in variant.get("selectedOptions", []):
                name = option["name"]
                value = option["value"]

                if name not in options:
                    options[name] = []

                if value not in options[name]:
                    options[name].append(value)

        return options
