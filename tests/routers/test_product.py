import random
import random
#-------------------------------------------------------------
#from src.application.utils.token_services import TokenService
import pytest
from fastapi import status
from sqlalchemy.orm import Session 

from src.models.user import UserModel
from src.application.sсhemas import UserAuth
from src.application.utils.token_services import TokenService
from src.services.user import UserService
from src.repositories import UserRepository, CartProductRepository
from src.models.user import UserModel
from src.models import CartProductModel



def test_get_product(generate_products, test_client):
    product = random.choice(generate_products)
    
    # Отправляем запрос на получение продукта
    response = test_client.get(f"/api/products/{product.id}")
    
    assert response.status_code == 200
    
    # Получаем данные из ответа и проверяем их
    response_data = response.json()
   #print(response_data)
    assert response_data["id"] == f'product-{product.id}'
    assert response_data["title"] == product.title
    assert response_data["description"] == product.description
    assert response_data["availableForSale"] == product.available_for_sale
    assert response_data["priceRange"] == product.price_range
    assert response_data["tags"] == product.tags
    assert len(response_data["images"]) > 0  # Проверяем, что изображение существует
    assert response_data["featuredImage"]["url"] == product.featured_image["url"]

    # Проверка на наличие опций и вариантов
    assert len(response_data["options"]) == len(product.options)
    assert len(response_data["variants"]['edges']) == len(product.variants)


def test_get_product_not_found(test_client):
    response = test_client.get("/api/products/1")
    assert response.status_code == 404
    assert response.json() == {"detail": "Product with ID=1 not found"}


def test_get_products(test_client, generate_products):
    response = test_client.get("/api/products/?page=1")
    assert response.status_code == 200
    
    response_data = response.json()
    
    # Проверяем, что возвращается правильное количество продуктов
    assert len(response_data["edges"]) == 5  # Или "edges" если используется GraphQL-style
    
    # Проверяем, что данные о продукте соответствуют ожиданиям
    for product_data in response_data["edges"]:  # Или response_data["edges"] для GraphQL
        # Проверяем основные поля
        assert "id" in product_data['node']
        # assert response_data["id"] in f'product-{product.id}'
        # assert response_data["title"] in product.title
        # assert response_data["description"] in product.description
        # assert response_data["availableForSale"] in product.available_for_sale
        # assert response_data["priceRange"] in product.price_range
        # assert response_data["tags"] in product.tags
        # assert len(response_data["images"]) > 0  # Проверяем, что изображение существует
        # assert response_data["featuredImage"]["url"] in product.featured_image["url"]

        # # Проверка на наличие опций и вариантов
        # assert len(response_data["options"]) == len(product.options)
        # assert len(response_data["variants"]['edges']) == len(product.variants)


# def test_get_products(test_client, generate_products):
#     response = test_client.get("/api/products/?page=1")
#     assert response.status_code == 200
#     response_data = response.json()
#     # Проверяем, что возвращается правильное количество продуктов
#     assert len(response_data["products"]) == 10
#     # Проверяем, что данные о продукте соответствуют ожиданиям
#     for product_data in response_data["products"]:
#         # Проверяем, что каждый продукт имеет хотя бы основные поля
#         assert "id" in product_data
#         assert "title" in product_data
#         assert "description" in product_data
#         assert "available_for_sale" in product_data
#         assert "price_range" in product_data
#         assert "tags" in product_data
#         assert "images" in product_data
#         assert len(product_data["images"]) > 0  # Проверяем, что изображение существует


def test_get_recommendations(test_client, generate_products):
    # Выбираем случайный продукт
    product = random.choice(generate_products)

    # Выполняем запрос на получение рекомендаций
    response = test_client.get(f"/api/products/{product.id}/recommendations")
    assert response.status_code == 200

    data = response.json()
    assert "products" in data
    assert isinstance(data["products"], list)

    # Если рекомендации есть — проверим структуру первого
    if data["products"]:
        rec_product = data["products"][0]
        assert "id" in rec_product
        assert "title" in rec_product
        assert "description" in rec_product
        assert "availableForSale" in rec_product
        assert "priceRange" in rec_product
        assert "tags" in rec_product
        assert "images" in rec_product
        assert isinstance(rec_product["images"], list)
        assert "featuredImage" in rec_product
        assert "url" in rec_product["featuredImage"]


def test_add_product(generate_products, test_user, mock_token_service, test_cart, test_client, test_session: Session):
    product = generate_products[0]
    print(f"Testing with product ID: {product.id}")
    some_id = product.id
    quantity_to_add = 2  # Указываем количество товара для добавления
    variant_id = None
    test_cart_id = test_cart.id

    # Создаем токен для тестового пользователя
    token = 'some_token'

    response = test_client.post(
        "/api/users/carts/items/",
        json={"product_id": some_id, "quantity": quantity_to_add, "variant_id": variant_id},  # Передаем данные в формате JSON
        headers={"Authorization": f"Bearer {token}"}
    )

    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.json()}")

    assert response.status_code == status.HTTP_201_CREATED 
    
    # База данных
    cart_product: CartProductModel = test_session.query(CartProductModel).filter(CartProductModel.cart_id == test_cart_id).first()
    
    assert cart_product.product_id == some_id
    assert cart_product.quantity == quantity_to_add
    variant = product.variants[0]
    expected_price = quantity_to_add * float(variant["price"]["amount"])
    assert response.json()['total_price'] == expected_price


def test_remove_product(mock_token_service, 
                        test_client, product_to_cart,
                        test_session: Session):
    # удаляем весь товар из корзины
    product_id = product_to_cart.product_id
    cart_id = product_to_cart.cart_id
    
    token = 'some_token'
    
    response = test_client.delete(
        f"/api/users/carts/items/{product_id}/",
        headers={"Authorization": f"Bearer {token}"},
        )
    
    assert response.status_code == status.HTTP_200_OK
    
    cart_product: CartProductModel = test_session.query(CartProductModel).filter(CartProductModel.cart_id == cart_id).first()
    
    assert cart_product is None