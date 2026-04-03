import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_PORT     = os.getenv("DB_PORT", "3306")
    DB_NAME     = os.getenv("DB_NAME", "urba_drain_agadir")
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY           = os.getenv("JWT_SECRET", "urba-drain-secret-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    BCRYPT_LOG_ROUNDS = 12
    CORS_ORIGINS      = ["http://localhost:3000"]
    DEBUG             = os.getenv("FLASK_ENV") == "development"
