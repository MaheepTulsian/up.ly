from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    llama_model_name: str = "llama-3.3-70b-versatile"
    environment: str = "dev"

    class Config:
        env_file = ".env"

settings = Settings()
