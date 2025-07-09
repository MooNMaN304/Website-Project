from src.exceptions.product_exceptions import NotFoundProductException, RecommendationException
from src.repositories import ProductAdapter, ProductRepository, ReviewRepository


class ProductService:
    def __init__(self, product_repository: ProductRepository, review_repository: ReviewRepository):
        self.product_repository = product_repository
        self.review_repository = review_repository
        self.adapter = ProductAdapter(product_repository, review_repository)

    def get_products_recommendation(self, product_id: int) -> list[dict]:
        try:
            current_product = self.product_repository.get(product_id)
            if current_product is None:
                raise NotFoundProductException(product_id)
        except Exception:
            raise NotFoundProductException(product_id)

        try:
            all_products = self.product_repository.get_all_prod(count=100)
        except Exception:
            raise RecommendationException(product_id)

        current_words = set(current_product.description.lower().split())
        scored_products = []

        for product in all_products:
            if product.id == product_id:
                continue  # исключаем сам продукт

            words = set(product.description.lower().split())
            common_words = current_words & words
            score = len(common_words)

            if score > 0:
                scored_products.append((product, score))

        scored_products.sort(key=lambda x: x[1], reverse=True)

        try:
            recommended = [self.adapter._to_graphql_format(p) for p, _ in scored_products[:5]]
        except Exception:
            raise RecommendationException(product_id)

        return recommended
