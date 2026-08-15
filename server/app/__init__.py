from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():
    """Application factory: crea y configura la app de Flask.

    Usamos este patrón (en vez de crear la app directamente en un
    archivo suelto) para que, a medida que agreguemos base de datos,
    autenticación, etc., todo se registre aquí de forma ordenada.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Permite que el frontend (en otro puerto/origen) pueda llamar a esta API.
    CORS(app)

    # Conecta la base de datos y el sistema de migraciones a esta app.
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Importa los modelos para que SQLAlchemy/Alembic los conozca
    # (si no se importan en algún punto, Alembic no los detecta).
    from app import models  # noqa: F401

    # Registramos las rutas definidas en app/routes/
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.historias import historias_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(historias_bp)

    return app
