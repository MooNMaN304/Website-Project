from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.config import Settings

# Import all models to ensure they are registered with Base
from src.models import cart, cart_product, category, order, order_product, product, review, user  # noqa: F401
from src.models.base import Base

# Загружаем настройки
settings = Settings()

# Создаем URL для подключения к базе данных
DATABASE_URL = settings.postgres_url()

# Создаем движок (engine)
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


# Функция для получения сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
