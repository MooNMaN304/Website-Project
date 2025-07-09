# src/modules/cart/exceptions.py


class CartException(Exception):
    """Базовое исключение для всех ошибок, связанных с корзиной."""


class CartProductAddException(CartException):
    """Ошибка при добавлении продукта в корзину."""


class CartProductUpdateException(CartException):
    """Ошибка при обновлении продукта в корзине."""


class CartProductRemoveException(CartException):
    """Ошибка при удалении продукта из корзины."""


class CartNotFoundException(CartException):
    """Ошибка когда корзина не найдена."""


class CartProductNotFoundException(CartException):
    """Ошибка когда продукт в корзине не найден."""


class CartProductPriceException(CartException):
    """Ошибка при установке цены продукта."""
