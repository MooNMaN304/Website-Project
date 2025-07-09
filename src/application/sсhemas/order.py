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

    @classmethod
    def from_orm(cls, order_model):
        """Convert OrderModel to OrderSchema with frontend compatibility"""
        return cls(
            id=order_model.id,
            user_id=order_model.user_id,
            payment=order_model.payment,
            created_at=getattr(order_model, "created_at", None),
            updated_at=getattr(order_model, "updated_at", None),
            order_id=str(order_model.id),
            status="completed" if order_model.payment else "pending",
            total_amount=0.0,  # TODO: Calculate from order items
            currency_code="USD",
            email=None,  # TODO: Get from user model
            shipping_address=None,  # TODO: Add to model
            payment_method="card" if order_model.payment else None,
            items=[],  # TODO: Get from order products
        )
