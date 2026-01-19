from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8"
    )
    aws_region: str
    aws_access_key: str
    aws_secret_key: str
    dynamo_table_name: str

settings = Settings()
