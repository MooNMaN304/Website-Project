import pytest
from sqlalchemy import create_engine, MetaData
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from src.main import app
from src.models import ProductModel, CategoryModel, UserModel, ReviewModel, CartModel, CartProductModel
from src.application.utils.token_services import TokenService
from src.database import get_db
from src.config import SETTINGS
from src.application.routers.user import get_token_service
from unittest.mock import Mock, patch
#------------------------------------------------------------
import os
from pathlib import Path

STATIC_DIR = Path("src/public/products")  # Путь до папки с изображениями
STATIC_URL_PREFIX = "/products/"   # Как ты монтируешь статику в FastAPI

#------------------------------------------------------------

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

# # Фикстура для очистки таблиц после каждого теста
# @pytest.fixture(autouse=True)
# def clean_tables(test_engine):
#     """
#     Очищает все таблицы после каждого теста.
#     """
#     yield  # Тест выполняется здесь

#     # Очистка таблиц после теста
#     metadata = MetaData()
#     metadata.reflect(bind=test_engine)  # Явное указание bind

#     with test_engine.connect() as connection:
#         with connection.begin():  # Открываем транзакцию
#             for table in reversed(metadata.sorted_tables):
#                 connection.execute(table.delete())

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

#--------------------------------------------------------------
# Фикстура для генерации n продуктов
# Фикстура
@pytest.fixture(scope="function")
def generate_products(generate_categories, test_session) -> list[ProductModel]:
    fake = Faker()
    products = []

    # Получаем список доступных изображений
    image_files = list(STATIC_DIR.glob("*.jpg")) + list(STATIC_DIR.glob("*.jpeg")) + list(STATIC_DIR.glob("*.png"))
    assert image_files, "No images found in static directory"

    for _ in range(5):
        category = fake.random.choice(generate_categories)

        options = [
            {"id": "option-1", "name": "Size", "values": ["S", "M", "L", "XL"]},
            {"id": "option-2", "name": "Color", "values": ["Red", "Blue", "Green"]}
        ]

        variants = []
        for size in options[0]["values"]:
            for color in options[1]["values"]:
                variants.append({
                    "id": f"variant-{size}-{color}",
                    "availableForSale": True,
                    "selectedOptions": [
                        {"name": "Size", "value": size},
                        {"name": "Color", "value": color}
                    ],
                    "price": {
                        "amount": '50',
                        "currencyCode": "USD"
                    }
                })

        # Выбор случайного локального изображения
        image_path = fake.random.choice(image_files)
        image_url = f"{STATIC_URL_PREFIX}{image_path.name}"

        featured_image = {
            "url": image_url,
            "altText": "Product Image",
            "width": 640,
            "height": 480
        }
        images = [featured_image]

        product = ProductModel(
            title=fake.unique.word(),
            description=fake.sentence(nb_words=10) + ' some',
            description_html=f"<p>{fake.sentence(nb_words=10)}</p>",
            handle=fake.unique.word().lower(),
            options=options,
            variants=variants,
            price_range={
                "minVariantPrice": {"amount": "50.00", "currencyCode": "USD"},
                "maxVariantPrice": {"amount": "500.00", "currencyCode": "USD"}
            },
            featured_image=featured_image,
            images=images,
            available_for_sale=True,
            seo={
                "title": fake.word(),
                "description": fake.sentence(nb_words=10)
            },
            tags=["fashion", "clothing", "summer"],
            category_id=category.id
        )

        test_session.add(product)
        products.append(product)

    test_session.commit()
    return products


# @pytest.fixture(scope="function")
# def generate_products(generate_categories, test_session) -> list[ProductModel]:
#     fake = Faker()
#     products = []
#     for _ in range(10):
#         category = fake.random.choice(generate_categories)
        
#         # Создание options
#         options = [
#             {"id": "option-1", "name": "Size", "values": ["S", "M", "L", "XL"]},
#             {"id": "option-2", "name": "Color", "values": ["Red", "Blue", "Green"]}
#         ]
        
#         # Создание вариантов
#         variants = []
#         for size in options[0]["values"]:
#             for color in options[1]["values"]:
#                 variants.append({
#                     "id": f"variant-{size}-{color}",
#                     "availableForSale": True,
#                     "selectedOptions": [
#                         {"name": "Size", "value": size},
#                         {"name": "Color", "value": color}
#                     ],
#                     "price": {
#                         "amount": str(fake.random.randint(50, 500)),
#                         "currencyCode": "USD"
#                     }
#                 })
        
#         # Создание изображения
#         image_url = fake.image_url(width=640, height=480)
#         featured_image = {
#             "url": image_url,
#             "altText": "Product Image",
#             "width": 640,
#             "height": 480
#         }
#         images = [{"url": image_url, "altText": "Product Image", "width": 640, "height": 480}]
        
#         product = ProductModel(
#             title=fake.unique.word(),
#             description=fake.sentence(nb_words=10),
#             description_html=f"<p>{fake.sentence(nb_words=10)}</p>",
#             handle=fake.unique.word().lower(),
#             options=options,
#             variants=variants,
#             price_range={
#                 "minVariantPrice": {"amount": "50.00", "currencyCode": "USD"},
#                 "maxVariantPrice": {"amount": "500.00", "currencyCode": "USD"}
#             },
#             featured_image=featured_image,
#             images=images,
#             available_for_sale=True,
#             seo={
#                 "title": fake.word(),
#                 "description": fake.sentence(nb_words=10)
#             },
#             tags=["fashion", "clothing", "summer"],
#             category_id=category.id
#         )
        
#         test_session.add(product)
#         products.append(product)
#     test_session.commit()
#     return products
#--------------------------------------------------------------

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
            password=hashed_password  # Сохраняем хешированный пароль
        )
        test_session.add(user)
        users.append(user)
    test_session.commit()
    return users

# Фикстура для TokenService
@pytest.fixture
def token_service():
    return TokenService(secret_key="my_secret_key")

# Фикстура для создания 1 пользователя
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

# Фикстура для создания корзины
@pytest.fixture
def test_cart(test_user, test_session) -> CartModel:
    cart = CartModel(user_id=test_user.id)
    test_session.add(cart)
    test_session.commit()
    return cart

# Фикстура для добавления товара в корзину
@pytest.fixture
def product_to_cart(test_cart, test_session, generate_products) -> CartProductModel:
    cart_product = CartProductModel(cart_id=test_cart.id, product_id=generate_products[0].id, quantity=4)
    test_session.add(cart_product)
    test_session.commit()
    return cart_product

# Фикстура для добавления отзыва
@pytest.fixture
def test_review(generate_products, test_user, test_session) -> ReviewModel:
    review = ReviewModel(product_id=generate_products[0].id, user_id=test_user.id, rating=5)
    test_session.add(review)
    test_session.commit()
    return review


# Фикстура для создания нескольких отзывов
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
