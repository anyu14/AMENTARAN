from datetime import datetime

from app.extensions import db

ESTADOS_VALIDOS = ("activa", "finalizada")


class Sesion(db.Model):
    __tablename__ = "sesiones"

    id = db.Column(db.Integer, primary_key=True)

    usuario_busca_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    usuario_voluntario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    estado = db.Column(db.String(20), nullable=False, default="activa")
    fecha_inicio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Sesion {self.id} ({self.estado})>"

    def to_dict(self):
        """Versión de la sesión segura para devolver por la API.

        No incluye datos personales de la otra persona (ni email ni
        id de usuario) — solo lo necesario para saber que hay una
        conexión activa y desde cuándo.
        """
        return {
            "id": self.id,
            "estado": self.estado,
            # "Z" al final indica explícitamente que es UTC — sin esto,
            # el navegador asume que la hora ya está en su huso horario
            # local y la muestra corrida.
            "fecha_inicio": self.fecha_inicio.isoformat() + "Z",
            "fecha_fin": (self.fecha_fin.isoformat() + "Z") if self.fecha_fin else None,
        }
