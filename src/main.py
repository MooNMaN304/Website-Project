from fastapi import FastAPI
from src.application.routers import product_router, user_router, cart_router, order_router  # Импортируем роутер

app = FastAPI()

# Подключаем роутер
app.include_router(product_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(order_router, prefix="/api")


# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
