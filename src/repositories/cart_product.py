from sqlalchemy.orm import Session

from src.application.logger import logger

from ..exceptions.carts import (
    CartProductAddException,
    CartProductNotFoundException,
    CartProductRemoveException,
    CartProductUpdateException,
)
from ..models import CartProductModel


class CartProductRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_product(
        self, cart_id: int, product_id: int, quantity: int, variant_id: str | None = None
    ) -> CartProductModel:
        try:
            # Ищем такой же товар с таким же вариантом в корзине
            query = self.session.query(CartProductModel).filter(
                CartProductModel.cart_id == cart_id, CartProductModel.product_id == product_id
            )

            if variant_id:
                query = query.filter(CartProductModel.variant_id == variant_id)

            cart_product = query.first()

            if cart_product:
                cart_product.quantity += quantity
                logger.info(f"Updated quantity for product {product_id} in cart {cart_id}")
            else:
                cart_product = CartProductModel(
                    cart_id=cart_id, product_id=product_id, quantity=quantity, variant_id=variant_id
                )
                self.session.add(cart_product)
                logger.info(f"Added product {product_id} to cart {cart_id}")

            self.session.commit()
            return cart_product
        except Exception as e:
            logger.error(f"Failed to add product {product_id} to cart: {str(e)}")
            raise CartProductAddException(f"Failed to add product {product_id} to cart: {str(e)}")

    def remove_product(self, cart_id: int, product_id: int, variant_id: str | None = None) -> None:
        try:
            query = self.session.query(CartProductModel).filter(
                CartProductModel.cart_id == cart_id, CartProductModel.product_id == product_id
            )

            if variant_id:
                query = query.filter(CartProductModel.variant_id == variant_id)

            cart_product = query.first()

            if not cart_product:
                logger.warning(f"Product {product_id} not found in cart {cart_id}")
                raise CartProductNotFoundException(f"Product {product_id} not found in cart")

            self.session.delete(cart_product)
            self.session.commit()
            logger.info(f"Removed product {product_id} from cart {cart_id}")

        except CartProductNotFoundException:
            raise
        except Exception as e:
            logger.error(f"Failed to remove product {product_id} from cart: {str(e)}")
            raise CartProductRemoveException(f"Failed to remove product {product_id} from cart: {str(e)}")

    def get_products_in_cart(self, cart_id: int) -> list[CartProductModel]:
        try:
            products = self.session.query(CartProductModel).filter(CartProductModel.cart_id == cart_id).all()
            return products
        except Exception as e:
            logger.error(f"Failed to get products from cart {cart_id}: {str(e)}")
            raise CartProductNotFoundException(f"Failed to get products from cart {cart_id}: {str(e)}")

    def change_quantity(
        self, cart_id: int, product_id: int, quantity: int, variant_id: str | None = None
    ) -> CartProductModel:
        try:
            query = self.session.query(CartProductModel).filter(
                CartProductModel.cart_id == cart_id, CartProductModel.product_id == product_id
            )

            if variant_id:
                query = query.filter(CartProductModel.variant_id == variant_id)

            cart_product = query.first()

            if not cart_product:
                logger.warning(f"Product {product_id} not found in cart {cart_id}")
                raise CartProductNotFoundException(f"Product {product_id} not found in cart")

            cart_product.quantity = quantity
            self.session.commit()
            logger.info(f"Updated quantity for product {product_id} in cart {cart_id}")
            return cart_product

        except CartProductNotFoundException:
            raise
        except Exception as e:
            logger.error(f"Failed to update quantity for product {product_id} in cart: {str(e)}")
            raise CartProductUpdateException(f"Failed to update quantity for product {product_id} in cart: {str(e)}")
