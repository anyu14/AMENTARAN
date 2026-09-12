from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models.usuario import Usuario
from app.models.historia import Historia
from app.models.reporte_historia import ReporteHistoria

moderacion_bp = Blueprint("moderacion", __name__, url_prefix="/api/moderacion")


def _usuario_moderador():
    """Devuelve (usuario, None) si quien llama es un moderador válido,
    o (None, (respuesta, status)) con el error a devolver si no lo es.

    Se centraliza acá porque los tres endpoints de este blueprint
    necesitan exactamente la misma verificación.
    """
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario is None:
        return None, (jsonify(error="Usuario no válido."), 401)

    if not usuario.es_moderador:
        return None, (jsonify(error="No tenés permisos de moderador."), 403)

    return usuario, None


@moderacion_bp.route("/historias-reportadas", methods=["GET"])
@jwt_required()
def listar_historias_reportadas():
    _, error = _usuario_moderador()
    if error:
        return error

    # Se incluyen también las ya ocultas (con oculta=True en la
    # respuesta) para que el panel pueda ofrecer un botón "mostrar" y
    # revertir una ocultación hecha por error.
    resultados = (
        db.session.query(Historia, func.count(ReporteHistoria.id).label("cantidad_reportes"))
        .join(ReporteHistoria, ReporteHistoria.historia_id == Historia.id)
        .group_by(Historia.id)
        .order_by(func.count(ReporteHistoria.id).desc())
        .all()
    )

    respuesta = []
    for historia, cantidad_reportes in resultados:
        reportes = (
            ReporteHistoria.query.filter_by(historia_id=historia.id)
            .order_by(ReporteHistoria.fecha_creacion.desc())
            .all()
        )
        respuesta.append({
            **historia.to_public_dict(),
            "oculta": historia.oculta,
            "cantidad_reportes": cantidad_reportes,
            "motivos": [r.motivo for r in reportes if r.motivo],
        })

    return jsonify(respuesta), 200


@moderacion_bp.route("/historias/<int:historia_id>/ocultar", methods=["POST"])
@jwt_required()
def ocultar_historia(historia_id):
    _, error = _usuario_moderador()
    if error:
        return error

    historia = Historia.query.get(historia_id)
    if historia is None:
        return jsonify(error="Historia no encontrada."), 404

    historia.oculta = True
    db.session.commit()

    return jsonify({**historia.to_public_dict(), "oculta": historia.oculta}), 200


@moderacion_bp.route("/historias/<int:historia_id>/mostrar", methods=["POST"])
@jwt_required()
def mostrar_historia(historia_id):
    _, error = _usuario_moderador()
    if error:
        return error

    historia = Historia.query.get(historia_id)
    if historia is None:
        return jsonify(error="Historia no encontrada."), 404

    historia.oculta = False
    db.session.commit()

    return jsonify({**historia.to_public_dict(), "oculta": historia.oculta}), 200
