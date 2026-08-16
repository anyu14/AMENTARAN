from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.usuario import Usuario
from app.models.sesion import Sesion

matching_bp = Blueprint("matching", __name__, url_prefix="/api/matching")


def _sesion_activa_de(usuario_id):
    """Busca una sesión activa donde el usuario sea busca_apoyo o voluntario."""
    return Sesion.query.filter(
        Sesion.estado == "activa",
        (Sesion.usuario_busca_id == usuario_id) | (Sesion.usuario_voluntario_id == usuario_id),
    ).first()


@matching_bp.route("/disponibilidad", methods=["PATCH"])
@jwt_required()
def cambiar_disponibilidad():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario is None:
        return jsonify(error="Usuario no válido."), 401

    if usuario.rol != "voluntario":
        return jsonify(error="Solo los voluntarios pueden marcar disponibilidad."), 403

    datos = request.get_json(silent=True) or {}
    disponible = datos.get("disponible")

    if not isinstance(disponible, bool):
        return jsonify(error="El campo 'disponible' debe ser true o false."), 400

    usuario.disponible = disponible
    db.session.commit()

    return jsonify(disponible=usuario.disponible), 200


@matching_bp.route("/conectar", methods=["POST"])
@jwt_required()
def conectar():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if usuario is None:
        return jsonify(error="Usuario no válido."), 401

    if usuario.rol != "busca_apoyo":
        return jsonify(error="Solo quien busca apoyo puede iniciar una conexión."), 403

    # Si ya tiene una sesión activa, se devuelve esa en vez de crear otra.
    existente = _sesion_activa_de(usuario_id)
    if existente:
        return jsonify(existente.to_dict()), 200

    # .with_for_update() bloquea la fila elegida hasta el commit: si dos
    # personas piden conectarse casi al mismo tiempo, la segunda espera
    # a que la primera termine y, al reintentar, ya no encuentra a este
    # voluntario disponible — evita que ambas lo reserven a la vez.
    voluntario = (
        Usuario.query.filter_by(rol="voluntario", disponible=True)
        .with_for_update()
        .first()
    )
    if voluntario is None:
        return jsonify(error="No hay voluntarios disponibles en este momento."), 409

    nueva_sesion = Sesion(
        usuario_busca_id=usuario_id,
        usuario_voluntario_id=voluntario.id,
    )
    voluntario.disponible = False  # evita que otra persona lo conecte también

    db.session.add(nueva_sesion)
    db.session.commit()

    return jsonify(nueva_sesion.to_dict()), 201


@matching_bp.route("/activa", methods=["GET"])
@jwt_required()
def sesion_activa():
    usuario_id = int(get_jwt_identity())
    sesion = _sesion_activa_de(usuario_id)

    if sesion is None:
        return jsonify(None), 200

    return jsonify(sesion.to_dict()), 200


@matching_bp.route("/<int:sesion_id>/finalizar", methods=["POST"])
@jwt_required()
def finalizar(sesion_id):
    usuario_id = int(get_jwt_identity())
    sesion = Sesion.query.get(sesion_id)

    if sesion is None:
        return jsonify(error="Sesión no encontrada."), 404

    es_parte_de_la_sesion = usuario_id in (sesion.usuario_busca_id, sesion.usuario_voluntario_id)
    if not es_parte_de_la_sesion:
        return jsonify(error="No tienes permiso para finalizar esta sesión."), 403

    if sesion.estado != "activa":
        return jsonify(error="Esta sesión ya está finalizada."), 400

    # A propósito NO se marca al voluntario como disponible de nuevo:
    # decide él mismo cuándo está listo para la siguiente persona.
    sesion.estado = "finalizada"
    sesion.fecha_fin = datetime.utcnow()
    db.session.commit()

    return jsonify(sesion.to_dict()), 200
