from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models import CartModel

class CartRepository:
    def __init__(self, cart_model: CartModel, session: Session):
        self.cart_model = cart_model
        self.session = session

#создание корзины
    def create(self, user_id: int) -> CartModel:
        cart = self.cart_model(user_id=user_id)
        self.session.add(cart)
        self.session.commit()
        self.session.refresh(cart)
        return cart
    
#корзина по user_id
    def get_by_user_id(self, user_id: int) -> CartModel:
        cart = self.session.query(self.cart_model).filter_by(user_id=user_id).first()
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        return cart
    

    



    
    #Удаление корзины наверное не нужно
    # def delete(self, user_id: int) -> None:
    #     cart = self.get_by_user_id(user_id=user_id)
    #     if not cart:
    #         raise HTTPException(status_code=404, detail="Cart not found")
    #     self.session.delete(cart)
    #     self.session.commit()

        
