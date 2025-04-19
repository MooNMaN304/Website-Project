from sqlalchemy.orm import Session
from src.models.review import ReviewModel


def test_create_review(generate_products, test_user, mock_token_service, test_client, test_session: Session):
    product = generate_products[0]
    product_id = product.id
    test_user_id = test_user.id
    rating = 5
    response = test_client.post(f"api/products/{product_id}/reviews",
                                headers={"Authorization": "Bearer sometoken"},
                                json={"rating": rating})

    assert response.status_code == 201
    # делаем вызов к базе данных, чтобы проверить, что данные были добавлены
    review: ReviewModel = test_session.query(ReviewModel).filter(ReviewModel.product_id == product_id).first()
    assert review.rating == rating
    assert review.user_id == test_user_id
    assert review.product_id == product_id


def test_update_review(test_review, mock_token_service, test_client, test_session: Session):
    product_id = test_review.product_id
    user_id = test_review.user_id
    new_rating = 3
    response = test_client.put(f"api/products/{product_id}/reviews",
                                headers={"Authorization": "Bearer sometoken"},
                                json={"rating": new_rating})

    assert response.status_code == 200
    # делаем вызов к базе данных, чтобы проверить, что данные были добавлены
    review: ReviewModel = test_session.query(ReviewModel).filter(ReviewModel.product_id == product_id).first()
    assert review.rating == new_rating
    assert review.user_id == user_id
    assert review.product_id == product_id


def test_delete_review(test_review, mock_token_service, test_client, test_session: Session):
    product_id = test_review.product_id
    review_id = test_review.id
    response = test_client.delete(f"api/products/{product_id}/reviews",
                                  headers={"Authorization": "Bearer sometoken"})
    assert response.status_code == 204
    review: ReviewModel = test_session.get(ReviewModel, review_id)
    assert review is None


def test_get_mid_raiting(test_multiple_reviews, test_client, test_session: Session) :
    product_id = test_multiple_reviews[0].product_id
    response = test_client.get(f"api/products/{product_id}")

    assert response.status_code == 200
    # проверить что средний рейтинг вернулся и является числом, поле rating и float
    rating = response.json()
    assert type(response.json()['product_rating']) == float
 
    
# To do 
# Реализовать логику создания orders
# Добавить проверку создания отзыва только на тот товар который был куплен