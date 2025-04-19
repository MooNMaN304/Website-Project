import bcrypt
from src.models.user import UserModel
from src.repositories.user import UserRepository
from src.repositories.cart import CartRepository
from typing import Any

from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from typing import Optional
from src.application.utils.token_services import TokenService


class UserService:
    def __init__(self, user_repository: UserRepository, cart_repository: CartRepository, token_service: TokenService):
        self.user_repository = user_repository
        self.cart_repository = cart_repository
        self.token_service = token_service
        
    def register(self, name: str, email: str, password: str) -> UserModel:
        hashed_password = self._hash_password(password)
        created_user = self.user_repository.create(name, email, hashed_password)
        self.cart_repository.create(created_user.id)
        return created_user
    
    @staticmethod
    def _hash_password(password):
        salt = bcrypt.gensalt()
        # Хешируем пароль с солью
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed_password
    
    def update_password(self, user_id: int, new_password: str) -> UserModel:
        hashed_password = self._hash_password(new_password)
        return self.user_repository.update_password(user_id, hashed_password)

    def login(self, email: str, password: str):
        user = self.user_repository.get_by_email(email)
        if user is None:
            raise ValueError("Некорректный e-mail!")
        
        # Проверяем пароль с помощью bcrypt.checkpw
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return self.token_service.create_access_token(user.id)
        raise ValueError("Некорректно введен password !!!")    
    



#Написать тест на токен сервис протестировать класс токен (мок-методы)
#

#'dsfdaflglajljleqpturopwr'
#'secret_key' + 'id user' + 'date expire'
#@staticmethod

#Создать тесты для логирования
#создать в базе данных users - фикстуру
#вбить email и пароль в тесте на роутер
#посмотреть ответ 200 и токен
#тест на 401 ошибку
