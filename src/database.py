from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.config import Settings

# Загружаем настройки
settings = Settings()

# Создаем URL для подключения к базе данных
DATABASE_URL = settings.postgres_url()

# Создаем движок (engine)
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Функция для получения сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()