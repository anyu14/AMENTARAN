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

    # Si un moderador la oculta tras revisar reportes, deja de aparecer
    # en el listado público — pero no se borra de la base de datos.
    oculta = db.Column(db.Boolean, nullable=False, default=False)

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
            # "Z" al final indica explícitamente que es UTC — sin esto,
            # el navegador asume que la hora ya está en su huso horario
            # local y la muestra corrida (mismo ajuste que en Sesion).
            "fecha_creacion": self.fecha_creacion.isoformat() + "Z",
        }
