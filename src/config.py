from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Awesome API"
    admin_email: str  # Обязательное поле
    items_per_user: int = 50

    # Переменные для подключения к базе данных
    host: str
    port: int
    dbname: str
    user: str
    password: str
    # Секретный ключ сайта
    
    secret_key: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def postgres_url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}"

SETTINGS = Settings()

if __name__ == '__main__':
    settings = Settings()
    a = 10

