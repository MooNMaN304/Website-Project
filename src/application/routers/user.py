import traceback
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.security import OAuth2PasswordBearer

from src.application.logger import logger
from src.application.routers.depends import get_user_repository, get_user_services
from src.application.sсhemas import UserAuth, UserInit, UserSchema
from src.exceptions.user_exceptions import (
    InvalidCredentialsException,
    NotFoundUserException,
    PasswordUpdateException,
    UserCreateException,
    UserException,
)
from src.repositories.user import UserRepository
from src.services.user import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter()


# 1. Получение одного пользователя
@router.get(
    "/users",
    tags=["Пользователи"],
    summary="Получить информацию о конкретном пользователе",
    response_model=UserSchema,
)
def get_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_service: UserService = Depends(get_user_services),
):
    try:
        user_id = user_service.token_service.get_user(token)
        user = user_service.user_repository.get(user_id)
        logger.info(f"Пользователь {user.email} запросил информацию о себе (user_id={user_id})")
        return UserSchema(username=user.name, password=user.password, email=user.email)
    except NotFoundUserException as e:
        logger.warning(f"Не найден пользователь по токену: {token}")
        raise HTTPException(status_code=404, detail=str(e))
    except UserException as e:
        logger.error(f"Ошибка при получении пользователя: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")


# 2. Создание нового пользователя
@router.post(
    "/users/",
    tags=["Пользователи"],
    summary="Добавить пользователя",
)
def create_user(
    data: Annotated[UserSchema, Form()],
    user_services: UserRepository = Depends(get_user_services),
):
    try:
        new_user = user_services.register(email=data.email, password=data.password, name=data.username)
        logger.info(f"Юзер с {data.email} зарегистрировался в приложении")
        return new_user
    except UserCreateException as e:
        logger.warning(f"Регистрация отклонена: email {data.email} уже занят")
        raise HTTPException(status_code=400, detail=str(e))
    except UserException as e:
        logger.error(f"Ошибка при регистрации пользователя {data.email}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")


# 3. Обновление пароля
@router.put(
    "/users/{user_id}/password/",
    tags=["Пользователи"],
    summary="Обновить пароль",
)
def update_user_password(
    user_id: int,
    new_password: str,
    user_service: UserService = Depends(get_user_services),
):
    try:
        user_service.update_password(user_id, new_password)
        logger.info(f"Пароль пользователя {user_id} обновлён")
        return {"message": "Пароль успешно обновлён"}
    except PasswordUpdateException as e:
        logger.warning(f"Ошибка при обновлении пароля пользователя {user_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except UserException as e:
        logger.error(f"Ошибка при обновлении пароля: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")


# 4. Удаление пользователя
@router.delete(
    "/users/{user_id}",
    tags=["Пользователи"],
    summary="Удалить пользователя",
)
def delete_user(
    user_id: int,
    user_repository: UserRepository = Depends(get_user_repository),
):
    try:
        user_repository.delete(user_id)
        logger.info(f"Пользователь с ID {user_id} был удалён")
        return {"message": "Пользователь удалён"}
    except NotFoundUserException as e:
        logger.warning(f"Попытка удалить несуществующего пользователя с ID {user_id}")
        raise HTTPException(status_code=404, detail=str(e))
    except UserException as e:
        logger.error(f"Ошибка при удалении пользователя {user_id}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")


# 5. Аутентификация пользователя
@router.post(
    "/users/login",
    tags=["Пользователи"],
    summary="Аутентификация пользователя",
    response_model=UserInit,
)
def login_user(
    data: Annotated[UserAuth, Form()],
    user_service: UserService = Depends(get_user_services),
):
    try:
        token = user_service.login(data.email, data.password)
        logger.info(f"Пользователь {data.email} успешно вошёл в систему")
        return UserInit(token=token)
    except InvalidCredentialsException as e:
        logger.warning(f"Ошибка входа для {data.email}: неверные данные")
        raise HTTPException(status_code=401, detail=str(e))
    except UserException as e:
        logger.error(f"Ошибка при входе {data.email}: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")
