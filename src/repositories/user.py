from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.models import UserModel


class UserRepository:
    def __init__(self, user_model: UserModel, session: Session):
        self.user_model = user_model
        self.session = session

    def get(self, user_id: int) -> UserModel:
        user = self.session.get(self.user_model, user_id)  # Исправлено: query.get() -> session.get()
        if not user:
            raise NotFoundUserException(f"User with ID={user_id} not found")
        return user

    def create(self, name: str, email: str, password: str) -> UserModel:
        user = self.user_model(name=name, email=email, password=password)
        try:
            self.session.flush(user)
            self.session.add(user)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ValueError("User with this email already exists")
        return user

    def update_password(self, user_id: int, new_password: str) -> UserModel:
        user = self.session.query(self.user_model).get(user_id)
        if not user:
            raise ValueError("User not found")
        user.password = new_password
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user_id: int) -> None:
        user = self.get(user_id)
        self.session.delete(user)
        self.session.commit()

    def get_by_email(self, email: str) -> UserModel:
        return self.session.query(self.user_model).filter(self.user_model.email == email).first()
