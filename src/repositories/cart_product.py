from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models import CartProductModel

class CartProductRepository:
    def __init__(self, cart_product_model: CartProductModel, session: Session):
        self.cart_product_model = cart_product_model
        self.session = session

    def add_product(self, cart_id: int, product_id: int, quantity: int) -> CartProductModel:
        #проверить есть ли продукт в корзине, если есть - добавить его колличество
        add_quantity = self.session.query(CartProductModel).filter(CartProductModel.cart_id ==
                                                                   cart_id, CartProductModel.product_id == product_id).first()
        if add_quantity:
            add_quantity.quantity += quantity
            self.session.commit()
            return add_quantity
        cart_product = self.cart_product_model(cart_id=cart_id, product_id=product_id, quantity=quantity)
        self.session.add(cart_product)
        self.session.commit()
        self.session.refresh(cart_product)
        return cart_product
    
    def remove_product(self, cart_id: int, product_id: int) -> None:
        cart_product = (
            self.session.query(self.cart_product_model)
            .filter_by(cart_id=cart_id, product_id=product_id)
            .first()
        )
        if not cart_product:
            raise HTTPException(status_code=404, detail="Product not found in cart")
        self.session.delete(cart_product)
        self.session.commit()

    def get_products_in_cart(self, cart_id: int) -> list[CartProductModel]: #[s for s.product_id.price in get_products_in_cart]
        return (
            self.session.query(self.cart_product_model)
            .filter_by(cart_id=cart_id)
            .all())
    
    #изменить колличество продуктов
    def change_quantity(self, card: id, product_id: int, quantity: int) -> None:
        cart_product = self.session.query(self.cart_product_model).filter_by(cart_id=card,
                                                                             product_id=product_id).first()
        if not cart_product:
            raise HTTPException(status_code=404, detail="Product not found in cart")
        cart_product.quantity = quantity
        self.session.commit()
        return cart_product

    def total_cost(self, cart_id: int) -> float:
        value = 0
        for product in self.get_products_in_cart(cart_id):
            value += product.product_id.price * product.quantity
        return value
    
    def clear_cart(self, cart_id: int) -> None:
        self.session.query(self.cart_product_model).filter_by(cart_id=cart_id).delete()
        self.session.commit()
