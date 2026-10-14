from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Company CRM"
    secret_key: str = ""
    debug: bool = True

    database_url: str = "sqlite:///./crmsqlite.db"

    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    telegram_bot_token: str = ""
    telegram_admin_chat_id: str = ""

    openai_api_key: str = ""
    openai_base_url: str = "http://localhost:11434/v1"
    openai_model: str = "gpt-4o-mini"

    local_llm_enabled: bool = True
    llm_timeout_seconds: int = 30


class Config:
    env_file = ".env"


settings = Settings()
