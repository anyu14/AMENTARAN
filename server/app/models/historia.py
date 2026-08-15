from datetime import datetime

from app.extensions import db


class Historia(db.Model):
    __tablename__ = "historias"

    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.Text, nullable=False)
    idioma = db.Column(db.String(2), nullable=False, default="es")
    fecha_creacion = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Quién la escribió. Se guarda para poder moderar contenido si hace
    # falta, pero la API nunca devuelve este dato al listar historias:
    # de cara al usuario, la historia siempre aparece sin autor.
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    def __repr__(self):
        return f"<Historia {self.id}>"

    def to_public_dict(self):
        """Versión de la historia segura para mostrar hacia afuera.

        A propósito NO incluye usuario_id: de cara a la API, una
        historia nunca revela quién la escribió.
        """
        return {
            "id": self.id,
            "contenido": self.contenido,
            "idioma": self.idioma,
            "fecha_creacion": self.fecha_creacion.isoformat(),
        }
