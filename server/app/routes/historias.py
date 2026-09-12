from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.historia import Historia
from app.models.usuario import Usuario
from app.models.reporte_historia import ReporteHistoria

historias_bp = Blueprint("historias", __name__, url_prefix="/api/historias")

CONTENIDO_MAX_LARGO = 5000
LIMITE_LISTADO = 50
MOTIVO_MAX_LARGO = 500


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
    # Las historias ocultas por un moderador no se filtran a nivel de
    # base de datos (se conservan para poder revisarlas), pero nunca
    # deben aparecer en el listado público.
    historias = (
        Historia.query.filter_by(oculta=False)
        .order_by(Historia.fecha_creacion.desc())
        .limit(LIMITE_LISTADO)
        .all()
    )
    return jsonify([h.to_public_dict() for h in historias]), 200


@historias_bp.route("/<int:historia_id>/reportar", methods=["POST"])
@jwt_required()
def reportar_historia(historia_id):
    usuario_id = int(get_jwt_identity())

    historia = Historia.query.get(historia_id)
    if historia is None:
        return jsonify(error="Historia no encontrada."), 404

    if historia.usuario_id == usuario_id:
        return jsonify(error="No podés reportar tu propia historia."), 400

    datos = request.get_json(silent=True) or {}
    motivo = (datos.get("motivo") or "").strip() or None

    if motivo and len(motivo) > MOTIVO_MAX_LARGO:
        return jsonify(
            error=f"El motivo no puede superar los {MOTIVO_MAX_LARGO} caracteres."
        ), 400

    nuevo_reporte = ReporteHistoria(
        historia_id=historia_id,
        usuario_id=usuario_id,
        motivo=motivo,
    )

    try:
        db.session.add(nuevo_reporte)
        db.session.commit()
    except IntegrityError:
        # Ya existe un reporte de este mismo usuario para esta historia
        # (restricción de unicidad en el modelo).
        db.session.rollback()
        return jsonify(error="Ya reportaste esta historia anteriormente."), 409

    return jsonify(mensaje="Reporte enviado. Gracias por avisarnos."), 201
