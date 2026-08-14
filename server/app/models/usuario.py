from datetime import datetime

from app.extensions import db

# Roles permitidos. Se validan a nivel de aplicación (no en la base de
# datos) para poder agregar roles nuevos en el futuro sin migraciones.
ROLES_VALIDOS = ("busca_apoyo", "voluntario")


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # "busca_apoyo" o "voluntario". Se valida en el código de la API,
    # no aquí, para poder agregar roles nuevos sin tocar la base de datos.
    rol = db.Column(db.String(20), nullable=False)

    idioma_preferido = db.Column(db.String(2), nullable=False, default="es")
    fecha_registro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<Usuario {self.email}>"
