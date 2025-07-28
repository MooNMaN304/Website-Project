import traceback
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from src.application.logger import logger
from src.application.routers import cart_router, order_router, product_router, user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Абсолютный путь до /public
BASE_DIR = Path(__file__).resolve().parent  # <--- это src/
PUBLIC_DIR = BASE_DIR / "public"  # <--- src/public

# Подключение статических файлов
app.mount("/products", StaticFiles(directory=PUBLIC_DIR / "products"), name="products")

# Подключение роутеров
app.include_router(product_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(order_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "FastAPI is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    # Get the full traceback from the exception object
    tb_str = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    logger.error(f"Unhandled exception: {tb_str}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": str(exc),
            "detail": tb_str,
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True)
