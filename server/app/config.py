import os
from datetime import timedelta
from dotenv import load_dotenv

# Carga las variables definidas en server/.env al entorno del proceso,
# para poder leerlas con os.environ / os.getenv.
load_dotenv()


class Config:
    """Configuración de la app, leída desde variables de entorno.

    Nunca escribimos aquí valores reales (URLs, contraseñas, claves) —
    solo el nombre de la variable de entorno de donde se leen.
    """
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "8"))
    )
