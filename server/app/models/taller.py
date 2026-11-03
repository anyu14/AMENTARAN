from datetime import datetime

from app.extensions import db


ESTADOS_TALLER = (
    "borrador",
    "publicado",
    "pospuesto",
    "cancelado",
    "finalizado",
)

MODALIDADES_TALLER = ("presencial", "online", "hibrido")


class Taller(db.Model):
    __tablename__ = "talleres"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(160), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    duracion_minutos = db.Column(db.Integer, nullable=True)
    modalidad = db.Column(db.String(20), nullable=False, default="presencial")
    lugar = db.Column(db.String(240), nullable=True)
    enlace = db.Column(db.String(500), nullable=True)
    plazas = db.Column(db.Integer, nullable=True)
    idioma = db.Column(db.String(2), nullable=False, default="es")
    estado = db.Column(db.String(20), nullable=False, default="borrador")

    organizador_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False,
    )

    fecha_creacion = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
    fecha_actualizacion = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "duracion_minutos": self.duracion_minutos,
            "modalidad": self.modalidad,
            "lugar": self.lugar,
            "enlace": self.enlace,
            "plazas": self.plazas,
            "idioma": self.idioma,
            "estado": self.estado,
            "organizador_id": self.organizador_id,
            "fecha_creacion": self.fecha_creacion.isoformat(),
            "fecha_actualizacion": self.fecha_actualizacion.isoformat(),
        }

    def __repr__(self):
        return f"<Taller {self.id}: {self.titulo}>"
