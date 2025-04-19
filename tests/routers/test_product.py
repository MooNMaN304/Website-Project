import random


def test_get_product(generate_products, test_client):
    product = random.choice(generate_products)
    response = test_client.get(f"api/products/{product.id}")
    assert response.status_code == 200
    assert response.json()["product_id"] == product.id
    assert response.json()["product_name"] == product.name


def test_get_product_not_found(test_client):
    response = test_client.get("/api/products/1")
    assert response.status_code == 404
    assert response.json() == {"detail": "Product with ID=1 not found"}


def test_get_products(test_client, generate_products):
    response = test_client.get("api/products/?page=1")
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data['products']) == 10

