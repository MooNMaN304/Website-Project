import traceback
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from src.application.logger import logger
from src.application.routers import cart_router, order_router, product_router, user_router
from src.config import SETTINGS
from src.database import create_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Handle application lifespan events."""
    # Startup
    create_tables()
    logger.info("Database tables created successfully")
    logger.info(f"Application starting in {SETTINGS.environment} mode")
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="Web Site API",
    description="API for the web site application",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not SETTINGS.is_production else "/api/docs",
    redoc_url="/redoc" if not SETTINGS.is_production else "/api/redoc",
    openapi_url="/openapi.json" if not SETTINGS.is_production else "/api/openapi.json",
)

# Add trusted host middleware for proxy support
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Configure CORS based on environment
allowed_origins = [
    "http://localhost:3000",  # Development frontend
    "http://localhost:8000",  # Backend (for self-requests)
]

if SETTINGS.is_production:
    # Production: more restrictive CORS
    allowed_origins.extend(
        [
            "http://web:3000",  # Production frontend service
            "http://app:8000",  # Production backend service
        ]
    )
else:
    # Development: allow all origins
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

    uvicorn.run(app, host="0.0.0.0", port=8000)
