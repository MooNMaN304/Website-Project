import logging
from typing import Any

from src.exceptions.carts import CartProductPriceException
from src.models.cart_product import CartProductModel
from src.repositories.cart import CartRepository
from src.repositories.cart_product import CartProductRepository

logger = logging.getLogger(__name__)


class CartProductService:
    def __init__(
        self,
        cart_repository: CartRepository,
        cart_product_repository: CartProductRepository,
    ):
        self.cart_repository = cart_repository
        self.cart_product_repo = cart_product_repository

    def get_total_items(self, cart_id: int) -> int:
        cart = self.cart_repository.get_cart(cart_id)
        return len(cart.cart_product_rel)

    def get_total_price(self, cart_id: int) -> float:
        total_price = 0.0
        cart = self.cart_repository.get_cart(cart_id)

        for item in cart.cart_product_rel:
            product = item.product_rel

            if not product or not product.variants:
                logger.warning(f"Товар отсутствует или не содержит вариантов (product_id={item.product_id})")
                continue

            matched_variant = self._find_variant(product.variants, item.variant_id)

            if not matched_variant:
                logger.warning(
                    f"Не найден вариант товара (product_id={item.product_id}, variant_id={item.variant_id})"
                )
                continue

            try:
                price = float(matched_variant["price"]["amount"])
                total_price += price * item.quantity
            except (KeyError, ValueError, TypeError) as e:
                logger.warning(
                    f"Ошибка при вычислении цены (product_id={item.product_id}, variant_id={item.variant_id}): {e}"
                )
                continue

        return total_price

    def serialize_cart_item(self, cart_product: CartProductModel) -> dict[str, Any]:
        product = cart_product.product_rel

        if not product or not product.variants:
            logger.warning(f"Не удалось сериализовать товар — отсутствует product или variants (cart_product_id={cart_product.id})")
            return {}

        variant = self._find_variant(product.variants, cart_product.variant_id)

        if not variant:
            logger.warning(f"Не найден вариант при сериализации (product_id={product.id}, variant_id={cart_product.variant_id})")
            return {}

        try:
            price = float(variant["price"]["amount"])
        except (KeyError, ValueError, TypeError) as e:
            logger.warning(f"Ошибка при чтении цены из варианта: {e}")
            raise CartProductPriceException(f"Некорректная цена в варианте товара: {e}")

        total_price = f"{price * cart_product.quantity:.2f}"

        return {
            "id": f"line-{cart_product.id}",
            "quantity": cart_product.quantity,
            "cost": {
                "totalAmount": {
                    "amount": total_price,
                    "currencyCode": variant["price"].get("currencyCode", "USD")
                }
            },
            "merchandise": {
                "id": variant["id"],
                "title": " / ".join(opt["value"] for opt in variant.get("selectedOptions", [])),
                "product": {
                    "id": f"product-{product.id}",
                    "title": product.title,
                    "handle": product.handle,
                    "featuredImage": {
                        "url": product.featured_image.get("url") if product.featured_image else None,
                        "altText": product.featured_image.get("altText", product.title)
                        if product.featured_image else product.title,
                    },
                },
                "selectedOptions": variant.get("selectedOptions", []),
            },
        }

    def _find_variant(self, variants: list[dict], variant_id: str | None) -> dict | None:
        if variant_id:
            for v in variants:
                if v["id"] == variant_id:
                    return v
        return variants[0] if variants else None
