import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class CartModel(AbstractBase):
    __tablename__ = 'carts'
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)

    def __str__(self):
        return self.user_id
    
    def __repr__(self):
        return f"CartModel('{self.user_id}')"