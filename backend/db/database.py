import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_ENV = os.getenv("DB_ENV", "local")


def get_database_url():

    # -------------------------
    # Local MySQL
    # -------------------------
    if DB_ENV == "local":

        host = "localhost"
        port = "3307"
        database = "iot_db"
        username = "root"
        password = "root"

        return (
            f"mysql+pymysql://"
            f"{username}:{password}"
            f"@{host}:{port}/{database}"
        )

    # -------------------------
    # Azure SQL Server
    # -------------------------
    elif DB_ENV == "azure":

        from urllib.parse import quote_plus

        server = os.getenv("DB_SERVER")
        database = os.getenv("DB_NAME")
        username = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")

        odbc_string = (
            "DRIVER={ODBC Driver 17 for SQL Server};"
            f"SERVER=tcp:{server},1433;"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={{{password}}};"
            "Encrypt=yes;"
            "TrustServerCertificate=no;"
            "Connection Timeout=30;"
        )

        return (
            "mssql+pyodbc:///?odbc_connect="
            + quote_plus(odbc_string)
        )

    else:
        raise ValueError(
            f"Unsupported DB_ENV: {DB_ENV}"
        )


DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()