import random
#-------------------------------------------------------------
#from src.application.utils.token_services import TokenService
import pytest
from fastapi import status
from sqlalchemy.orm import Session 

from src.models.user import UserModel
from src.application.sсhemas import UserAuth
from src.application.utils.token_services import TokenService
from src.services.user import UserService
from src.repositories import UserRepository, CartProductRepository
from src.models.user import UserModel
from src.models import CartProductModel


def test_get_user(test_user, test_client, test_session, mock_token_service):
    token = 'some_token'
    response = test_client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    # assert response.json()["user_id"] == test_user.id
    assert response.json()["username"] == test_user.name
    assert response.json()["email"] == test_user.email

#-------------------------------------------------------------
def test_login_success(test_client, generate_user):
    users = generate_user
    user = users[0]  # Берем первого пользователя из списка

    # Данные для запроса
    login_data = {
        "email": user.email,
        "password": "password123"  # Передаем пароль в чистом виде
    }

    # Выполняем запрос
    response = test_client.post("/api/users/login", data=login_data)

    # Проверяем результат
    assert response.status_code == status.HTTP_200_OK
    assert "token" in response.json()


def test_login_failure_wrong_password(test_client, generate_user):
    users = generate_user
    user = users[0]  # Берем первого пользователя из списка

    login_data = {
        "email": user.email,
        "password": "wrong_password"  # Неверный пароль
    }

    response = test_client.post("/api/users/login", data=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Некорректно введен password !!!"}


def test_login_failure_wrong_email(test_client, generate_user):
    users = generate_user
    user = users[0]  # Берем первого пользователя из списка

    login_data = {
        "email": "wrong_email@example.com",  # Неверный email
        "password": "password123"
    }

    response = test_client.post("/api/users/login", data=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Некорректный e-mail!"}


def test_token_user(token_service):
    user_id = 123  # ID пользователя
    token = token_service.create_access_token(user_id)  # Создаем токен

    # Извлекаем ID пользователя из токена
    decoded_user_id = token_service.get_user(token)

    # Проверяем, что ID пользователя совпадает
    assert decoded_user_id == user_id

    






