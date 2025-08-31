import pytest
from sqlalchemy import MetaData

from src.models import CategoryModel, ProductModel


@pytest.fixture
def clean_database(test_engine):
    """
    Fixture to clean all database tables before test execution.
    """
    # Clean database before test
    metadata = MetaData()
    metadata.reflect(bind=test_engine)

    with test_engine.connect() as connection, connection.begin():
        # Delete data from all tables in reverse order to handle foreign key constraints
        for table in reversed(metadata.sorted_tables):
            connection.execute(table.delete())

    yield

    # Optionally clean again after test if needed
    # with test_engine.connect() as connection, connection.begin():
    #     for table in reversed(metadata.sorted_tables):
    #         connection.execute(table.delete())


def test_fill_database_with_test_data(clean_database, generate_products, test_session):
    """
    Test that fills the database with test data using the generate_products fixture.
    This test first cleans the database, then generates test data.
    """
    # The clean_database fixture ensures DB is clean before test
    # The generate_products fixture creates test data

    # Verify that products were created
    products = test_session.query(ProductModel).all()
    assert len(products) > 0, "No products were generated"

    # Verify that categories were created (generate_products depends on generate_categories)
    categories = test_session.query(CategoryModel).all()
    assert len(categories) > 0, "No categories were generated"

    # Verify that each product has a valid category
    for product in products:
        assert product.category_id is not None, f"Product {product.title} has no category"
        category = test_session.query(CategoryModel).filter(CategoryModel.id == product.category_id).first()
        assert category is not None, f"Product {product.title} has invalid category_id"


def test_verify_product_structure(clean_database, generate_products, test_session):
    """
    Test to verify product structure and data integrity.
    """
    products = test_session.query(ProductModel).all()

    # Verify each product has required fields
    for product in products:
        _verify_product_basic_fields(product)
        _verify_product_variants(product)
        _verify_product_options(product)


def test_verify_category_structure(clean_database, generate_products, test_session):
    """
    Test to verify category structure and data integrity.
    """
    categories = test_session.query(CategoryModel).all()

    # Verify category structure
    for category in categories:
        assert category.name is not None, "Category name should not be None"
        assert len(category.name) > 0, "Category name should not be empty"


def _verify_product_basic_fields(product):
    """Helper function to verify basic product fields."""
    assert product.title is not None, "Product title should not be None"
    assert product.description is not None, "Product description should not be None"
    assert product.handle is not None, "Product handle should not be None"
    assert product.price_range is not None, "Product price_range should not be None"
    assert product.featured_image is not None, "Product featured_image should not be None"
    assert product.images is not None, "Product images should not be None"
    assert product.available_for_sale is not None, "Product available_for_sale should not be None"
    assert product.seo is not None, "Product seo should not be None"
    assert product.tags is not None, "Product tags should not be None"
    assert product.category_id is not None, "Product category_id should not be None"


def _verify_product_variants(product):
    """Helper function to verify product variants structure."""
    assert product.variants is not None, "Product variants should not be None"
    assert len(product.variants) > 0, "Product should have at least one variant"

    for variant in product.variants:
        assert "id" in variant, "Variant should have id"
        assert "availableForSale" in variant, "Variant should have availableForSale"
        assert "selectedOptions" in variant, "Variant should have selectedOptions"
        assert "price" in variant, "Variant should have price"


def _verify_product_options(product):
    """Helper function to verify product options structure."""
    assert product.options is not None, "Product options should not be None"
    assert len(product.options) > 0, "Product should have at least one option"

    for option in product.options:
        assert "id" in option, "Option should have id"
        assert "name" in option, "Option should have name"
        assert "values" in option, "Option should have values"
