from fastapi import APIRouter, Query, HTTPException, Depends, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated

from src.repositories.user import UserRepository

from src.application.utils.token_services import TokenService
from src.services.user import UserService
from src.application.shemas import UserSchema, UserAuth, UserInit
from src.config import SETTINGS
from src.application.routers.depends import get_user_repository, get_user_repository, get_token_service, get_user_services
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from src.database import get_db
from src.services.user import UserService


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 1.Получение одного пользователя
@router.get(
    "/users",
    tags=["Пользователи"],
    summary="Получить информацию о конкретном пользователе",
    response_model=UserSchema,
)
def get_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    #user_id: int,
    user_service: UserService = Depends(get_user_services)
):
    try:
        user = user_service.user_repository.get(user_service.token_service.get_user(token)) 
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    return UserSchema(
        user_id=user.id,
        username=user.name,
        password=user.password,
        email=user.email
    )

# 2. Cоздание нового пользователя
@router.post(
    "/users/",
    tags=["Пользователи"],
    summary="Добавить пользователя",
)
def create_user(
    #product: UserSchema,
    data: Annotated[UserSchema, Form()],
    user_services: UserRepository = Depends(get_user_services)
):
    try:
        new_user = user_services.register(email = data.email, password = data.password, name=data.username)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# 3. Обновление пароля
@router.put(
    "/users/{user_id}/password/",
    tags=["Пользователи"],
    summary="Обновить пароль",
)
def update_user_password(
    user_id: int,
    new_password: str,
    user_service: UserService = Depends(get_user_services)
):
    user_service.update_password(user_id, new_password)
    return {"message": "Password updated successfully"}

# 4. Удаление пользователя
@router.delete(
    "/users/{user_id}",
    tags=["Пользователи"],
    summary="Удалить пользователя"
)
def delete_user(
    user_id: int,
    user_repository: UserRepository = Depends(get_user_repository)
):
    user_repository.delete(user_id)
    return {"message": "User deleted"}

# 5. Аутентификация пользователя
@router.post(
    "/users/login",
    tags=["Пользователи"],
    summary="Аутентификация пользователя",
    )
def login_user(
    data: Annotated[UserAuth, Form()],
    user_service: UserService = Depends(get_user_services),
    response_model=UserInit
):
    try:
        return response_model(
            token=user_service.login(data.email, data.password)
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

