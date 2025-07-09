from sqlalchemy.orm import Session

from src.application.logger import logger
from src.exceptions.carts import CartNotFoundException
from src.models import CartModel


class CartRepository:
    def __init__(self, cart_model: CartModel, session: Session):
        self.cart_model = cart_model
        self.session = session

    def create(self, user_id: int) -> CartModel:
        try:
            cart = self.cart_model(user_id=user_id)
            self.session.add(cart)
            self.session.commit()
            self.session.refresh(cart)
            logger.info(f"Created cart for user {user_id}")
            return cart
        except Exception as e:
            logger.error(f"Failed to create cart: {e}")
            raise

    def get_by_user_id(self, user_id: int) -> CartModel:
        cart = self.session.query(self.cart_model).filter_by(user_id=user_id).first()
        if not cart:
            logger.warning(f"Cart not found for user {user_id}")
            raise CartNotFoundException(f"Cart not found for user {user_id}")
        return cart

    def get_cart(self, cart_id: int) -> CartModel:
        cart = self.session.query(self.cart_model).filter(self.cart_model.id == cart_id).first()
        if not cart:
            logger.warning(f"Cart not found with id {cart_id}")
            raise CartNotFoundException(f"Cart not found with id {cart_id}")
        return cart
