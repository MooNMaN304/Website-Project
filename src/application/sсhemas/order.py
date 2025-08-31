from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrderSchema(BaseModel):
    id: int
    user_id: int
    payment: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Frontend compatibility fields
    order_id: str | None = None
    status: str = "pending"
    total_amount: float = 0.0
    currency_code: str = "USD"
    email: str | None = None
    shipping_address: dict | None = None
    payment_method: str | None = None
    items: list | None = None

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def _calculate_total_amount(order_model) -> float:
        """Calculate total amount from order products."""
        total_amount = 0.0

        if hasattr(order_model, "order_products") and order_model.order_products:
            for order_product in order_model.order_products:
                if order_product.product and order_product.product.price_range:
                    try:
                        # Get the minimum price from price_range
                        price_range = order_product.product.price_range
                        if isinstance(price_range, dict):
                            min_price = price_range.get("minVariantPrice", {})
                            if isinstance(min_price, dict):
                                price_str = min_price.get("amount", "0.0")
                                price = float(price_str) if isinstance(price_str, (str, int, float)) else 0.0
                            else:
                                price = 0.0
                        else:
                            price = 0.0

                        total_amount += price * order_product.quantity
                    except (ValueError, TypeError, KeyError):
                        # If we can't parse the price, skip this item
                        continue

        return total_amount

    @staticmethod
    def _build_order_items(order_model) -> list:
        """Build order items list for frontend compatibility."""
        items = []

        if hasattr(order_model, "order_products") and order_model.order_products:
            for order_product in order_model.order_products:
                if order_product.product:
                    try:
                        # Get product price
                        price = 0.0
                        if order_product.product.price_range:
                            price_range = order_product.product.price_range
                            if isinstance(price_range, dict):
                                min_price = price_range.get("minVariantPrice", {})
                                if isinstance(min_price, dict):
                                    price_str = min_price.get("amount", "0.0")
                                    price = float(price_str) if isinstance(price_str, (str, int, float)) else 0.0

                        item = {
                            "id": order_product.id,
                            "product_id": order_product.product_id,
                            "name": order_product.product.title or "Unknown Product",
                            "title": order_product.product.title or "Unknown Product",
                            "quantity": order_product.quantity,
                            "price": price,
                        }
                        items.append(item)
                    except (ValueError, TypeError, AttributeError):
                        continue

        return items

    @classmethod
    def from_orm(cls, order_model):
        """Convert OrderModel to OrderSchema with frontend compatibility"""
        total_amount = cls._calculate_total_amount(order_model)
        items = cls._build_order_items(order_model)

        # Get email from order-specific field or fallback to user email
        email = order_model.email
        if not email and hasattr(order_model, "user") and order_model.user:
            email = order_model.user.email

        # Determine payment method
        payment_method = order_model.payment_method
        if not payment_method and order_model.payment:
            payment_method = "card"  # Default payment method if payment is true

        return cls(
            id=order_model.id,
            user_id=order_model.user_id,
            payment=order_model.payment,
            created_at=getattr(order_model, "created_at", None),
            updated_at=getattr(order_model, "updated_at", None),
            order_id=str(order_model.id),
            status="completed" if order_model.payment else "pending",
            total_amount=total_amount,
            currency_code="USD",
            email=email,
            shipping_address=order_model.shipping_address,
            payment_method=payment_method,
            items=items,
        )
