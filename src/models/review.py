from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import AbstractBase

class ReviewModel(AbstractBase):
    __tablename__ = 'reviews'
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    rating = Column(Integer, nullable=False)

    # Добавляем ограничение на уровень базы данных
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    def __str__(self):
        return f"Review(user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})"

    def __repr__(self):
        return f"ReviewModel(user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})"
    



# from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
# from sqlalchemy.orm import relationship
# from .base import AbstractBase

# class ReviewModel(AbstractBase):
#     __tablename__ = 'reviews'
#     user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
#     product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
#     rating = Column(Integer, nullable=False)

#     # Отношения
#     user = relationship("UserModel", back_populates="reviews")
#     product = relationship("ProductModel", back_populates="reviews")

#     # Ограничение на уровень базы данных
#     __table_args__ = (
#         CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
#     )

#     def __str__(self):
#         return f"Review(user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})"

#     def __repr__(self):
#         return f"ReviewModel(user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})"