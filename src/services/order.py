from src.models import OrderModel
from src.repositories.cart import CartRepository
from src.repositories.order import OrderRepository
from src.repositories.order_product import OrderProductRepository
from src.exceptions.order_exceptions import CartIsEmpty, OrderNotFoundException
from src.application.logger import logger


class OrderService:
    def __init__(
        self,
        order_product_repository: OrderProductRepository,
        order_repository: OrderRepository,
        cart_repository: CartRepository,
    ):
        self.order_repository = order_repository
        self.order_product = order_product_repository
        self.cart_repository = cart_repository

    def create(self, user_id: int) -> OrderModel:
        logger.info(f"Создание заказа для пользователя {user_id}")
        cart = self.cart_repository.get_by_user_id(user_id)

        if not cart or len(cart.cart_product_rel) == 0:
            logger.warning(f"Корзина пользователя {user_id} пуста — заказ не создан")
            raise CartIsEmpty()

        order = self.order_repository.create_order(user_id)
        logger.info(f"Создан заказ с ID {order.id} для пользователя {user_id}")

        for product in cart.cart_product_rel:
            self.order_product.add_product_to_order(
                order_id=order.id,
                product_id=product.product_id,
                quantity=product.quantity,
            )
            logger.debug(f"Добавлен продукт {product.product_id} (x{product.quantity}) в заказ {order.id}")

        return order

    def get_order_by_id(self, order_id: int) -> OrderModel:
        logger.info(f"Получение заказа с ID {order_id}")
        order = self.order_repository.get_order(order_id)

        if not order:
            logger.warning(f"Заказ с ID {order_id} не найден")
            raise OrderNotFoundException(order_id)

        return order

    def get_user_orders(self, user_id: int) -> list[OrderModel]:
        logger.info(f"Получение всех заказов пользователя {user_id}")
        return self.order_repository.get_user_orders(user_id)
