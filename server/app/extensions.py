from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# Estas instancias se crean "vacías" aquí y se conectan a la app
# dentro de create_app() (app/__init__.py). Así cualquier archivo del
# proyecto puede hacer `from app.extensions import db` sin depender
# de cómo se construyó la app.
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
