from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import AbstractBase

class ProductModel(AbstractBase):
    __tablename__ = 'products'
    
    # Основные поля
    title = Column(String, nullable=False)  # переименовали name -> title
    description = Column(String)
    description_html = Column(String)
    handle = Column(String, unique=True)  # новый параметр
    
    # Варианты и цены
    variants = Column(JSON, default=[])  # заменили size/color/delivery
    options = Column(JSON, default=[])  # новый параметр
    price_range = Column(JSON)  # заменили price
    
    # Изображения
    featured_image = Column(JSON)  # заменили image
    images = Column(JSON, default=[])  # новый параметр
    
    # Метаданные
    available_for_sale = Column(Boolean, default=True)  # новый параметр
    seo = Column(JSON)  # новый параметр
    tags = Column(JSON, default=[])  # новый параметр
    
    # Связи (оставляем как было)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    rating = relationship("ReviewModel", backref="product", cascade="all, delete-orphan")
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # новый параметр

    def __str__(self):
        return f"{self.title} ({self.id})"
    
    def __repr__(self):
        return f"ProductModel(id={self.id}, title='{self.title}', handle='{self.handle}')"
    