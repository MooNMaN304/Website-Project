from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Основные настройки
    app_name: str = "Awesome API"
    admin_email: str  # обязательное поле
    items_per_user: int = 50

    # Переменные для подключения к базе данных
    host: str
    port: int
    dbname: str
    user: str
    password: str

    # Секретный ключ сайта
    secret_key: str

    # Дополнительные переменные из .env
    domain: str
    email: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

    def postgres_url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}"


SETTINGS = Settings()

# Для отладки (опционально)
if __name__ == '__main__':
    print(SETTINGS.model_dump())
