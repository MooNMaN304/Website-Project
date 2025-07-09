class OrderException(Exception):
    """Базовое исключение для заказов"""
    pass


class CartIsEmpty(OrderException):
    """Корзина пуста"""
    def __init__(self):
        super().__init__("Невозможно создать заказ: корзина пуста")


class OrderNotFoundException(OrderException):
    """Заказ не найден"""
    def __init__(self, order_id: int):
        super().__init__(f"Заказ с ID {order_id} не найден")
