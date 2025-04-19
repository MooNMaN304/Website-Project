from src.models.cart import CartModel
from src.repositories.cart import CartRepository

class CartProductService:
    def __init__(self, cart_model : CartModel, cart_repository: CartRepository):
        self.cart_model = cart_model
        self.cart_repository = cart_repository

    # def cart_value(self, cart_id):#user_id: int):
    #     # This is a method that calculates the total value of the cart
    #     cost_calculated = 