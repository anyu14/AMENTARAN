from datetime import datetime

from app.extensions import db


class Mensaje(db.Model):
    __tablename__ = "mensajes"

    id = db.Column(db.Integer, primary_key=True)

    sesion_id = db.Column(db.Integer, db.ForeignKey("sesiones.id"), nullable=False)
    autor_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    contenido = db.Column(db.Text, nullable=False)
    fecha_envio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<Mensaje {self.id} (sesion {self.sesion_id})>"

    def to_dict(self):
        """Versión del mensaje segura para devolver por la API.

        No incluye autor_id: de cara al chat, cada mensaje se muestra
        según lo escribió "yo" o "la otra persona" (eso lo resuelve el
        endpoint comparando contra el usuario logueado), no exponiendo
        el id de nadie en la respuesta.
        """
        return {
            "id": self.id,
            "sesion_id": self.sesion_id,
            "contenido": self.contenido,
            # "Z" al final indica explícitamente que es UTC — sin esto,
            # el navegador interpretaría la hora como si ya estuviera
            # en su huso horario local y la mostraría corrida.
            "fecha_envio": self.fecha_envio.isoformat() + "Z",
        }
