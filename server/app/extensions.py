from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

# Estas instancias se crean "vacías" aquí y se conectan a la app
# dentro de create_app() (app/__init__.py). Así cualquier archivo del
# proyecto puede hacer `from app.extensions import db` sin depender
# de cómo se construyó la app.
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# cors_allowed_origins="*" para desarrollo, igual que hacemos con
# CORS(app) para la API REST — el frontend corre en otro puerto.
socketio = SocketIO(cors_allowed_origins="*")
