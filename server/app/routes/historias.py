from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.historia import Historia
from app.models.usuario import Usuario

historias_bp = Blueprint("historias", __name__, url_prefix="/api/historias")

CONTENIDO_MAX_LARGO = 5000
LIMITE_LISTADO = 50


@historias_bp.route("", methods=["POST"])
@jwt_required()
def crear_historia():
    datos = request.get_json(silent=True) or {}
    contenido = (datos.get("contenido") or "").strip()

    if not contenido:
        return jsonify(error="El contenido de la historia no puede estar vacío."), 400

    if len(contenido) > CONTENIDO_MAX_LARGO:
        return jsonify(
            error=f"El contenido no puede superar los {CONTENIDO_MAX_LARGO} caracteres."
        ), 400

    # El autor sale del token, nunca del cuerpo de la petición — así
    # nadie puede publicar "a nombre de" otro usuario.
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    idioma = datos.get("idioma") or usuario.idioma_preferido

    nueva_historia = Historia(
        contenido=contenido,
        idioma=idioma,
        usuario_id=usuario_id,
    )
    db.session.add(nueva_historia)
    db.session.commit()

    return jsonify(nueva_historia.to_public_dict()), 201


@historias_bp.route("", methods=["GET"])
def listar_historias():
    historias = (
        Historia.query.order_by(Historia.fecha_creacion.desc())
        .limit(LIMITE_LISTADO)
        .all()
    )
    return jsonify([h.to_public_dict() for h in historias]), 200
