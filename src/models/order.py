from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import AbstractBase

class OrderModel(AbstractBase):
    __tablename__ = 'orders'
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    payment = Column(Boolean, default=False)
    
    # Связи
    #products = relationship("OrderProductModel", backref="order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"OrderModel(id={self.id}, user_id={self.user_id}, payment={self.payment})"    

    def __str__(self):
            return f"Заказ #{self.id} ({'оплачен' if self.payment else 'не оплачен'})"


# from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
# from sqlalchemy.orm import relationship

# from .base import AbstractBase


# class OrderModel(AbstractBase):
#     __tablename__ = 'order'
#     user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
#     product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
#     payment = Column(Boolean, nullable=False)

#     def __str__(self):
#         return self.user_id, self.id, self.product_id, self.payment
    
#     def __repr__(self):
#         return f"OrderModel('{self.user_id}', '{self.id}', '{self.product_id}', '{self.payment}')"