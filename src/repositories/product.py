from sqlalchemy.orm import Session
from src.models import ProductModel


class NotFoundProductException(Exception):
    """Исключение, которое возникает, если продукт не найден"""


class ProductRepository:
    def __init__(self, product_model: ProductModel, session: Session):
        self.product_model = product_model
        self.session = session

    def get(self, product_id: int) -> ProductModel:
        if product_id is None:
            raise ValueError("Product ID is required")
        product = self.session.query(self.product_model).get(product_id)
        if not product:
            raise NotFoundProductException(f"Product with ID={product_id} not found")
        return product

    def get_all(self, page: int, count: int = 10) -> list[ProductModel]:
        offset = (page - 1) * count
        products = (
            self.session.query(self.product_model)
            .offset(offset)  # Пропускаем предыдущие записи
            .limit(count)    # Ограничиваем количество записей
            .all()
        )
        return products 

    def create(self, name: str, price: float, size: str, color: str,
               delivery: str, description: str, image: str, category_id: int) -> ProductModel:
        product = self.product_model(
            name=name,
            price=price,
            size=size,
            color=color,
            delivery=delivery,
            description=description,
            image=image,
            category_id=category_id
        )
        self.session.add(product)
        self.session.commit()
        self.session.refresh(product)  # Обновляем объект, чтобы получить ID
        return product

    def update(self, product_id: int, name: str, price: float, size: str,
               color: str, delivery: str,  description: str, image: str, category_id: int) -> ProductModel:
        product = self.get(product_id)
        product.name = name
        product.price = price
        product.size = size
        product.color = color
        product.delivery = delivery
        product.description = description
        product.category_id = category_id
        self.session.commit()
        self.session.refresh(product)  # Обновляем объект
        return product

    def get_products_by_category(self, category_id: int) -> list[ProductModel]:
        products = self.session.query(self.product_model).filter_by(category_id=category_id).all()
        return products
    
    
    def get_products_by_price_ascending(self) -> list[ProductModel]:
        products = self.session.query(self.product_model).order_by(self.product_model.price.asc()).all()
        return products

    
    def delete(self, product_id: int) -> None:
        product = self.get(product_id)
        self.session.delete(product)
        self.session.commit()

