class ProductException(Exception):
    """Базовое исключение для операций с продуктами."""
    pass


class NotFoundProductException(ProductException):
    """Продукт не найден."""
    def __init__(self, product_id: int):
        super().__init__(f"Продукт с ID {product_id} не найден")


class ProductDeleteException(ProductException):
    """Ошибка при удалении продукта."""
    def __init__(self, product_id: int):
        super().__init__(f"Не удалось удалить продукт с ID {product_id}")


class ProductListException(ProductException):
    """Ошибка при получении списка продуктов."""
    def __init__(self, reason: str = "Не удалось получить список продуктов"):
        super().__init__(reason)


class RecommendationException(ProductException):
    """Ошибка при генерации рекомендаций."""
    def __init__(self, product_id: int):
        super().__init__(f"Не удалось получить рекомендации для продукта с ID {product_id}")
