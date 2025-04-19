import pytest
from sqlalchemy import create_engine, MetaData
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from src.main import app
from src.models import ProductModel, CartProductModel, CartModel, CategoryModel, UserModel, ReviewModel
from src.application.utils.token_services import TokenService
from src.database import get_db
from src.config import SETTINGS
from src.application.routers.user import get_token_service
from unittest.mock import Mock, patch

from faker import Faker
import random
#--------------------

import bcrypt

#--------------------
# Инициализируем генератор случайных данных

# Фикстура для тестового движка
@pytest.fixture(scope="module")
def test_engine() -> Engine:
    test_db_url = SETTINGS.postgres_url()
    engine = create_engine(test_db_url)
    return engine

# Фикстура для фабрики сессий
@pytest.fixture(scope="module")
def test_session_maker(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Фикстура для тестовой сессии
@pytest.fixture(scope="function")
def test_session(test_session_maker):
    session = test_session_maker()
    try:
        yield session
    finally:
        session.close()

# Фикстура для очистки таблиц после каждого теста
@pytest.fixture(autouse=True)
def clean_tables(test_engine):
    """
    Очищает все таблицы после каждого теста.
    """
    yield  # Тест выполняется здесь

    # Очистка таблиц после теста
    metadata = MetaData()
    metadata.reflect(bind=test_engine)  # Явное указание bind

    with test_engine.connect() as connection:
        with connection.begin():  # Открываем транзакцию
            for table in reversed(metadata.sorted_tables):
                connection.execute(table.delete())

# Фикстура для тестового клиента
@pytest.fixture(scope="function")
def test_client(test_session):
    def override_get_db():
        try:
            yield test_session
        finally:
            test_session.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client

# Фикстура для генерации 10 категорий
@pytest.fixture(scope="function")
def generate_categories(test_session):
    fake = Faker()
    categories = []
    for _ in range(10):
        category = CategoryModel(name=fake.unique.word())
        test_session.add(category)
        categories.append(category)
    test_session.commit()  # Перенесено за цикл для оптимизации
    return categories

# Фикстура для генерации n продуктов
@pytest.fixture(scope="function")
def generate_products(generate_categories, test_session) -> list[ProductModel]:
    fake = Faker()
    products = []
    for _ in range(10):
        category = fake.random.choice(generate_categories)
        product = ProductModel(
            name=fake.unique.word(),  # Используем fake.unique.word() для уникальных имен
            price=float(fake.random.randint(50, 500)),
            size=fake.random.choice(["S", "M", "L"]),
            color=fake.color_name(),
            delivery=f"{fake.random.randint(1, 7)} days",
            description=fake.sentence(nb_words=10),
            image=fake.image_url(width=640, height=480),
            category_id=category.id
        )
        test_session.add(product)
        products.append(product)
    test_session.commit()
    return products

# Фикстура для создания n пользователей
@pytest.fixture(scope="function")
def generate_user(test_session):
    fake = Faker()
    users = []
    for _ in range(10):
        # Хешируем пароль перед сохранением в базу данных
        hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
        user = UserModel(
            name=fake.unique.word(),
            email=fake.email(),
            password=hashed_password.decode('utf-8')  # Сохраняем хешированный пароль
        )
        test_session.add(user)
        users.append(user)
    test_session.commit()
    return users

# Фикстура для TokenService
@pytest.fixture
def token_service():
    return TokenService(secret_key="my_secret_key")

# Фикстура для создания 1 пользователz
@pytest.fixture(scope="function")
def test_user(test_session):
    fake = Faker()
    # Хешируем пароль перед сохранением в базу данных
    hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
    user = UserModel(
            name=fake.unique.word(),
            email=fake.email(),
            password=hashed_password.decode('utf-8')  # Сохраняем хешированный пароль
        )
    test_session.add(user)
    test_session.commit()
    return user


@pytest.fixture
def mock_token_service(test_user):
    # Создаем моковый TokenService
    def get_mock_token_service():
        token_service = Mock()
        token_service.get_user.return_value = test_user.id  # Мокируем метод get_user
        return token_service

    # Переопределяем зависимость get_token_service
    app.dependency_overrides[get_token_service] = get_mock_token_service

    # Возвращаем клиента
    yield 

    # Очищаем переопределения после завершения теста
    app.dependency_overrides.clear()


@pytest.fixture
def test_cart(test_user, test_session) -> CartModel:
    cart = CartModel(user_id=test_user.id)
    test_session.add(cart)
    test_session.commit()
    return cart


@pytest.fixture
def product_to_cart(test_cart, test_session, generate_products) -> CartProductModel:
    cart_product = CartProductModel(cart_id = test_cart.id, product_id = generate_products[0].id, quantity = 4)
    test_session.add(cart_product)
    test_session.commit()
    return cart_product


@pytest.fixture
def test_review(generate_products, test_user, test_session) -> ReviewModel:
    review = ReviewModel(product_id=generate_products[0].id, user_id=test_user.id,
                         rating=5)
    test_session.add(review)
    test_session.commit()
    return review


@pytest.fixture
def test_multiple_reviews(generate_products, generate_user, test_session) -> list[ReviewModel]:
    product = generate_products[0]
    reviews = []
    for user in generate_user:
        review = ReviewModel(product_id=product.id, user_id=user.id, rating=random.randint(1,5))
        test_session.add(review)
        reviews.append(review)
    test_session.commit()
    return reviews

# @pytest.fixture
# def test_multiple_cart_products(product_to_cart, test_session):
