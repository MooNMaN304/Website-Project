import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from .base import AbstractBase


class UserModel(AbstractBase):
    __tablename__ = 'users'
    name = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)

    def __str__(self):
        return self.name, self.id, self.email
    
    def __repr__(self):
        return f"UserModel('{self.name}', '{self.id}', '{self.email}', '{self.password}')"