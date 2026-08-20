from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.sesion import Sesion
from app.models.mensaje import Mensaje

mensajes_bp = Blueprint("mensajes", __name__, url_prefix="/api")

CONTENIDO_MAX_LARGO = 5000
LIMITE_LISTADO = 200


def _es_parte_de_la_sesion(sesion, usuario_id):
    return usuario_id in (sesion.usuario_busca_id, sesion.usuario_voluntario_id)


@mensajes_bp.route("/mensajes", methods=["POST"])
@jwt_required()
def enviar_mensaje():
    usuario_id = int(get_jwt_identity())

    datos = request.get_json(silent=True) or {}
    sesion_id = datos.get("sesion_id")
    contenido = (datos.get("contenido") or "").strip()

    if not sesion_id or not contenido:
        return jsonify(error="Faltan datos: sesion_id y contenido son obligatorios."), 400

    try:
        sesion_id = int(sesion_id)
    except (TypeError, ValueError):
        return jsonify(error="sesion_id inválido."), 400

    if len(contenido) > CONTENIDO_MAX_LARGO:
        return jsonify(
            error=f"El contenido no puede superar los {CONTENIDO_MAX_LARGO} caracteres."
        ), 400

    sesion = Sesion.query.get(sesion_id)
    if sesion is None:
        return jsonify(error="Sesión no encontrada."), 404

    if not _es_parte_de_la_sesion(sesion, usuario_id):
        return jsonify(error="No tienes permiso para escribir en esta conversación."), 403

    if sesion.estado != "activa":
        return jsonify(error="Esta conversación ya finalizó."), 400

    nuevo_mensaje = Mensaje(
        sesion_id=sesion_id,
        autor_id=usuario_id,
        contenido=contenido,
    )

    try:
        db.session.add(nuevo_mensaje)
        db.session.commit()
    except IntegrityError:
        # Red de seguridad ante una condición de carrera (por ejemplo,
        # que la sesión se haya borrado justo entre la verificación de
        # arriba y este commit); evita un error 500 sin explicación.
        db.session.rollback()
        return jsonify(error="No se pudo enviar el mensaje. Intenta de nuevo."), 409

    return jsonify({**nuevo_mensaje.to_dict(), "es_mio": True}), 201


@mensajes_bp.route("/sesiones/<int:sesion_id>/mensajes", methods=["GET"])
@jwt_required()
def listar_mensajes(sesion_id):
    usuario_id = int(get_jwt_identity())

    sesion = Sesion.query.get(sesion_id)
    if sesion is None:
        return jsonify(error="Sesión no encontrada."), 404

    if not _es_parte_de_la_sesion(sesion, usuario_id):
        return jsonify(error="No tienes permiso para ver esta conversación."), 403

    # A propósito no se filtra por estado de la sesión: el historial de
    # una conversación finalizada se puede seguir leyendo, solo ya no
    # se pueden mandar mensajes nuevos (eso lo bloquea enviar_mensaje).
    #
    # Se pide en orden descendente (los más recientes primero) para que
    # el límite se aplique sobre los últimos mensajes, no los primeros
    # — si no, en una conversación larga los mensajes nuevos dejarían
    # de aparecer. Después se invierte la lista para mostrarla en el
    # orden cronológico normal.
    mensajes = (
        Mensaje.query.filter_by(sesion_id=sesion_id)
        .order_by(Mensaje.fecha_envio.desc())
        .limit(LIMITE_LISTADO)
        .all()
    )
    mensajes.reverse()

    return jsonify([
        {**m.to_dict(), "es_mio": m.autor_id == usuario_id} for m in mensajes
    ]), 200
