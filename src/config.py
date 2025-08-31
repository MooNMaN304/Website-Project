from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str  # Обязательное поле
    items_per_user: int = 50

    # Environment setting
    environment: str = "development"

    # Переменные для подключения к базе данных
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str

    # Секретный ключ сайта
    secret_key: str

    model_config = SettingsConfigDict(
        env_file=".env.production" if "production" in str(__file__) else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def postgres_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


SETTINGS = Settings()

if __name__ == "__main__":
    settings = Settings()
    a = 10
