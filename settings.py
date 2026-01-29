"""
Конфигурация приложения через Pydantic Settings.

Все переменные окружения валидируются при старте приложения.
Если обязательная переменная отсутствует — приложение НЕ запустится.

Использование:
    from settings import settings
    
    db_url = settings.supabase.db_url
    openai_key = settings.openai.api_key
"""

from typing import Optional

from pydantic import Field, field_validator, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


# ==============================================================================
# Database Settings
# ==============================================================================

class PostgresSettings(BaseSettings):
    """Настройки подключения к PostgreSQL (Yandex Cloud — read-only)."""
    
    model_config = SettingsConfigDict(env_prefix="PG__")
    
    host: str = Field(description="Хост базы данных")
    port: int = Field(default=6432, description="Порт базы данных")
    user: str = Field(description="Имя пользователя")
    password: str = Field(description="Пароль")
    database: str = Field(description="Имя базы данных")
    
    @computed_field
    @property
    def url(self) -> str:
        """Сформировать URL подключения (asyncpg)."""
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
    
    @computed_field
    @property
    def sync_url(self) -> str:
        """Сформировать URL подключения (psycopg2)."""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"


class SupabaseSettings(BaseSettings):
    """Настройки Supabase (SDK + direct Postgres)."""
    
    model_config = SettingsConfigDict(env_prefix="SUPABASE_")
    
    # SDK settings
    project_id: str = Field(description="Supabase Project ID (ref)")
    url: str = Field(description="Supabase URL для SDK")
    publishable_key: str = Field(description="Публичный ключ (anon key)")
    secret_key: str = Field(description="Секретный ключ (service_role)")
    
    # Direct Postgres
    db_host: str = Field(description="Хост PostgreSQL")
    db_port: int = Field(default=5432, description="Порт PostgreSQL")
    db_name: str = Field(default="postgres", description="Имя базы данных")
    db_user: str = Field(default="postgres", description="Пользователь")
    db_password: str = Field(description="Пароль базы данных")
    db_sslmode: str = Field(default="require", description="SSL режим")
    
    @computed_field
    @property
    def db_url(self) -> str:
        """Сформировать URL подключения к Supabase Postgres."""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}?sslmode={self.db_sslmode}"


# ==============================================================================
# AI Providers Settings
# ==============================================================================

class OpenAISettings(BaseSettings):
    """Настройки OpenAI API."""
    
    model_config = SettingsConfigDict(env_prefix="OPENAI__")
    
    api_key: str = Field(description="OpenAI API Key")
    url: str = Field(
        default="https://api.openai.com/v1/chat/completions",
        description="OpenAI Chat Completions endpoint"
    )
    org_id: Optional[str] = Field(default=None, description="OpenAI Organization ID")
    
    @field_validator("api_key")
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        if not v.startswith("sk-"):
            raise ValueError("OpenAI API key должен начинаться с 'sk-'")
        return v


class OpenRouterSettings(BaseSettings):
    """Настройки OpenRouter API."""
    
    model_config = SettingsConfigDict(env_prefix="OPENROUTER__")
    
    api_key: str = Field(description="OpenRouter API Key")
    url: str = Field(
        default="https://openrouter.ai/api/v1",
        description="OpenRouter API endpoint"
    )


# ==============================================================================
# Transcription Services Settings
# ==============================================================================

class SynopsisSettings(BaseSettings):
    """Настройки SynopsisAI транскрибера."""
    
    model_config = SettingsConfigDict(env_prefix="SYNOPSIS__")
    
    api_key: str = Field(description="Synopsis API Key")
    url: str = Field(
        default="https://api.synopsisai.ru/v1/synopses",
        description="Synopsis API endpoint"
    )


class SpeakAISettings(BaseSettings):
    """Настройки SpeakAI транскрибера."""
    
    model_config = SettingsConfigDict(env_prefix="SPEAKAI__")
    
    api_key: str = Field(description="SpeakAI API Key")
    auth_url: str = Field(description="SpeakAI Auth endpoint")
    upload_url: str = Field(description="SpeakAI Upload endpoint")
    download_url: str = Field(description="SpeakAI Download endpoint (с {media_id})")


class NexaraSettings(BaseSettings):
    """Настройки Nexara транскрибера."""
    
    model_config = SettingsConfigDict(env_prefix="NEXARA__")
    
    api_key: str = Field(description="Nexara API Key")
    url: str = Field(
        default="https://api.nexara.ru/api/v1/audio/transcriptions",
        description="Nexara API endpoint"
    )


# ==============================================================================
# Google Settings
# ==============================================================================

class GoogleSettings(BaseSettings):
    """Настройки Google API (Service Account + impersonation)."""
    
    model_config = SettingsConfigDict(env_prefix="GOOGLE_")
    
    service_account_json_b64: str = Field(
        description="Service Account JSON в base64"
    )
    impersonate_user_email: str = Field(
        description="Email пользователя для Domain-wide delegation"
    )


# ==============================================================================
# Integration Settings
# ==============================================================================

class ProxySettings(BaseSettings):
    """Настройки прокси-сервера."""
    
    model_config = SettingsConfigDict(env_prefix="PROXY__")
    
    http: Optional[str] = Field(default=None, description="HTTP прокси")
    https: Optional[str] = Field(default=None, description="HTTPS прокси")


class SMTPSettings(BaseSettings):
    """Настройки SMTP для отправки email."""
    
    model_config = SettingsConfigDict(env_prefix="SMTP__")
    
    host: str = Field(default="smtp.gmail.com", description="SMTP сервер")
    port: int = Field(default=587, description="SMTP порт")
    user: str = Field(description="Email аккаунт")
    password: str = Field(description="Пароль (App Password для Gmail)")


class N8NSettings(BaseSettings):
    """Настройки n8n интеграции."""
    
    model_config = SettingsConfigDict(env_prefix="N8N__")
    
    webhook_url: str = Field(description="URL вебхука n8n")
    api_key: Optional[str] = Field(default=None, description="n8n API Key")


class ZoomSettings(BaseSettings):
    """Настройки Zoom Server-to-Server OAuth."""
    
    model_config = SettingsConfigDict(env_prefix="ZOOM_")
    
    account_id: str = Field(description="Zoom Account ID")
    client_id: str = Field(description="Zoom Client ID")
    client_secret: str = Field(description="Zoom Client Secret")
    webhook_secret: str = Field(description="Zoom Webhook Secret Token")


class NakamaAPISettings(BaseSettings):
    """Настройки подключения к Nakama API (spellit.ai)."""
    
    model_config = SettingsConfigDict(env_prefix="NAKAMA_API__")
    
    base_url: str = Field(description="Base URL Nakama API")
    access_key: str = Field(description="API Access Key")


class PachcaSettings(BaseSettings):
    """Настройки PACHCA (мессенджер для алертов)."""
    
    model_config = SettingsConfigDict(env_prefix="PACHCA__")
    
    webhook_url: str = Field(description="PACHCA Webhook URL")


# ==============================================================================
# Main Settings
# ==============================================================================

class Settings(BaseSettings):
    """
    Главный класс настроек приложения.
    
    Объединяет все вложенные настройки и предоставляет
    единую точку доступа к конфигурации.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )
    
    # === Application Settings ===
    debug: bool = Field(default=False, description="Режим отладки")
    environment: str = Field(default="local", description="Окружение: local/dev/prod")
    
    # === Database ===
    pg: PostgresSettings = Field(default_factory=PostgresSettings)
    supabase: SupabaseSettings = Field(default_factory=SupabaseSettings)
    
    # === AI Providers ===
    openai: OpenAISettings = Field(default_factory=OpenAISettings)
    openrouter: OpenRouterSettings = Field(default_factory=OpenRouterSettings)
    
    # === Transcribers ===
    synopsis: SynopsisSettings = Field(default_factory=SynopsisSettings)
    speakai: SpeakAISettings = Field(default_factory=SpeakAISettings)
    nexara: NexaraSettings = Field(default_factory=NexaraSettings)
    
    # === Google ===
    google: GoogleSettings = Field(default_factory=GoogleSettings)
    
    # === Integrations ===
    proxy: ProxySettings = Field(default_factory=ProxySettings)
    smtp: SMTPSettings = Field(default_factory=SMTPSettings)
    n8n: N8NSettings = Field(default_factory=N8NSettings)
    zoom: ZoomSettings = Field(default_factory=ZoomSettings)
    nakama_api: NakamaAPISettings = Field(default_factory=NakamaAPISettings)
    pachca: PachcaSettings = Field(default_factory=PachcaSettings)
    
    # === PII Detector ===
    pii_detector_api_key: Optional[str] = Field(default=None, alias="PII_DETECTOR_API_KEY")
    pii_detector_base_url: Optional[str] = Field(default=None, alias="PII_DETECTOR_BASE_URL")


# ==============================================================================
# Singleton Instance
# ==============================================================================

# Создаётся один раз при импорте модуля
# Если .env отсутствует или переменные не заданы — будет ошибка валидации
try:
    settings = Settings()
except Exception as e:
    # В режиме разработки можно закомментировать raise и работать без .env
    print(f"⚠️  Ошибка загрузки настроек: {e}")
    print("   Убедитесь, что файл .env существует и содержит все обязательные переменные.")
    raise
