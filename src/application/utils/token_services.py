import bcrypt

from typing import Any
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from typing import Optional


class TokenService:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    ALGORITHM = "HS256"
    TIMEDELTA = timedelta(minutes=1000)  # 1000 минут

    def create_access_token(self, user_id: int) -> str:
        """
        Создает JWT-токен для пользователя.

        :param user_id: ID пользователя.
        :return: JWT-токен.
        """
        expire = datetime.now(timezone.utc) + self.TIMEDELTA  # Срок действия токена
        to_encode = {"exp": expire, "sub": str(user_id)}  # Данные для кодирования
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.ALGORITHM)
        return encoded_jwt

    def get_user(self, token: str) -> Optional[int]:
        """
        Извлекает ID пользователя из JWT-токена.

        :param token: JWT-токен.
        :return: ID пользователя или None, если токен невалидный.
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.ALGORITHM])
            user_id = int(payload["sub"])  # Извлекаем ID пользователя
            return user_id
        except jwt.ExpiredSignatureError:
            print("Токен истек.")
            raise HTTPException(
                status_code=status.HTTP_307_TEMPORARY_REDIRECT)
        except jwt.InvalidTokenError:
            print("Невалидный токен.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED)
