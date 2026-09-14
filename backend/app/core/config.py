from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NAWI OIML Test Report System"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api"

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()