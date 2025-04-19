from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models import CategoryModel

class CategoryRepository:
    def __init__(self, category_model: CategoryModel, session: Session):
        self.category_model = category_model
        self.session = session

    def get(self, category_id: int) -> CategoryModel:
        if category_id is None:
            raise ValueError("User ID is required")
        category = self.session.query(self.category_model).get(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    def create(self, name: str) -> CategoryModel:
        category = self.category_model(name=name)
        self.session.add(category)
        self.session.commit()
        self.session.refresh(category)
        return category
    
    def delete(self, category_id: int) -> None:
        category = self.get(category_id)
        self.session.delete(category)
        self.session.commit()