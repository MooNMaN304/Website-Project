from sqlalchemy.orm import Session
from typing import List, Optional
from src.models import ReviewModel

class ReviewRepository:
    def __init__(self, session: Session, review_model: ReviewModel):
        self.session = session
        self.review_model = review_model

#Ставим оценку продукту оценку
    def create_review(self, user_id: int, product_id: int, rating: int) -> ReviewModel:
        review = ReviewModel(user_id=user_id, product_id=product_id, rating=rating)
        self.session.add(review)
        self.session.commit()
        self.session.refresh(review)
        return review
    
#Возвращает оценку по его ID.
    def get_review_by_id(self, review_id: int) -> Optional[ReviewModel]:
        return self.session.query(ReviewModel).filter(ReviewModel.id == review_id).first()

#Возвращает все оценки, оставленные пользователем с указанным ID.
    def get_reviews_by_user_id(self, user_id: int) -> List[ReviewModel]:
        return self.session.query(ReviewModel).filter(ReviewModel.user_id == user_id).all()

#Возвращает все отзывы для продукта с указанным ID.
    def get_reviews_by_product_id(self, product_id: int) -> List[ReviewModel]:
        return self.session.query(ReviewModel).filter(ReviewModel.product_id == product_id).all()
    
#Возвращаем ID оценки продукта по ID юзера и ID продукта
    def get_review_id_by_user_id_and_product_id(self, user_id: int, product_id: int) -> Optional[ReviewModel]:
        return self.session.query(ReviewModel.id).filter(ReviewModel.user_id == user_id,
                                                         ReviewModel.product_id == product_id).first()

#Обновляет рейтинг отзыва по его ID.
    def update_review(self, review_id: int, rating: int) -> Optional[ReviewModel]:
        review = self.get_review_by_id(review_id)
        if review:
            review.rating = rating
            self.session.commit()
            self.session.refresh(review)
        return review

#Удаляет отзыв по его ID.
    def delete_review(self, review_id: int) -> bool:
        review = self.get_review_by_id(review_id)
        if review:
            self.session.delete(review)
            self.session.commit()
            return True
        return False

#Получение средний оценки продукта
    def calculate_rating(self, product_id: int) -> float:
        reviews = self.get_reviews_by_product_id(product_id)
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return 0.0