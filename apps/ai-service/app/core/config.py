from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://tenderkz:changeme@localhost:5432/tenderkz"
    REDIS_URL: str = "redis://localhost:6379/0"
    API_URL: str = "http://localhost:3001"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "tenderkz://localhost"]
    MODEL_PATH: str = "data/processed/win_probability_model.joblib"
    JWT_SECRET: str = "changeme"

    class Config:
        env_file = ".env"


settings = Settings()
