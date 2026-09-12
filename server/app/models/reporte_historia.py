from datetime import datetime

from app.extensions import db


class ReporteHistoria(db.Model):
    __tablename__ = "reportes_historia"

    id = db.Column(db.Integer, primary_key=True)

    historia_id = db.Column(db.Integer, db.ForeignKey("historias.id"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    motivo = db.Column(db.Text, nullable=True)
    fecha_creacion = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Una misma persona no puede reportar la misma historia más de una
    # vez — evita que alguien infle el contador de reportes a propósito.
    __table_args__ = (
        db.UniqueConstraint("historia_id", "usuario_id", name="uq_reporte_historia_usuario"),
    )

    def __repr__(self):
        return f"<ReporteHistoria historia={self.historia_id} usuario={self.usuario_id}>"
