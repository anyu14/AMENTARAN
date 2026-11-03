from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.taller import (
    ESTADOS_TALLER,
    MODALIDADES_TALLER,
    Taller,
)
from app.models.usuario import Usuario


talleres_bp = Blueprint("talleres", __name__, url_prefix="/api/talleres")


def _usuario_gestor():
    identidad = get_jwt_identity()

    try:
        usuario_id = int(identidad)
    except (TypeError, ValueError):
        return None, (jsonify(error="Sesión no válida."), 401)

    usuario = db.session.get(Usuario, usuario_id)

    if usuario is None:
        return None, (jsonify(error="Usuario no válido."), 401)

    if not usuario.gestiona_talleres:
        return None, (
            jsonify(error="No tienes permiso para gestionar talleres."),
            403,
        )

    return usuario, None


def _fecha_desde_texto(valor):
    if not isinstance(valor, str):
        return None

    valor = valor.strip()

    if valor.endswith("Z"):
        valor = valor[:-1] + "+00:00"

    try:
        fecha = datetime.fromisoformat(valor)
        if fecha.tzinfo is not None:
            fecha = fecha.replace(tzinfo=None)
        return fecha
    except ValueError:
        return None


def _entero_opcional(valor, nombre, minimo=1):
    if valor in (None, ""):
        return None, None

    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"{nombre} debe ser un número entero."

    if numero < minimo:
        return None, f"{nombre} debe ser igual o mayor que {minimo}."

    return numero, None


def _actualizar_taller(taller, datos, creando=False):
    errores = []

    if creando or "titulo" in datos:
        titulo = (datos.get("titulo") or "").strip()
        if not titulo:
            errores.append("El título es obligatorio.")
        elif len(titulo) > 160:
            errores.append("El título no puede superar los 160 caracteres.")
        else:
            taller.titulo = titulo

    if creando or "descripcion" in datos:
        descripcion = (datos.get("descripcion") or "").strip()
        if not descripcion:
            errores.append("La descripción es obligatoria.")
        elif len(descripcion) > 5000:
            errores.append("La descripción no puede superar los 5000 caracteres.")
        else:
            taller.descripcion = descripcion

    if creando or "fecha_inicio" in datos:
        fecha = _fecha_desde_texto(datos.get("fecha_inicio"))
        if fecha is None:
            errores.append("La fecha y la hora no son válidas.")
        else:
            taller.fecha_inicio = fecha

    if "duracion_minutos" in datos:
        duracion, error = _entero_opcional(
            datos.get("duracion_minutos"),
            "La duración",
            15,
        )
        if error:
            errores.append(error)
        else:
            taller.duracion_minutos = duracion

    if "plazas" in datos:
        plazas, error = _entero_opcional(datos.get("plazas"), "Las plazas")
        if error:
            errores.append(error)
        else:
            taller.plazas = plazas

    if creando or "modalidad" in datos:
        modalidad = datos.get("modalidad") or "presencial"
        if modalidad not in MODALIDADES_TALLER:
            errores.append("La modalidad seleccionada no es válida.")
        else:
            taller.modalidad = modalidad

    if "lugar" in datos:
        lugar = (datos.get("lugar") or "").strip() or None
        if lugar and len(lugar) > 240:
            errores.append("El lugar no puede superar los 240 caracteres.")
        else:
            taller.lugar = lugar

    if "enlace" in datos:
        enlace = (datos.get("enlace") or "").strip() or None
        if enlace and len(enlace) > 500:
            errores.append("El enlace no puede superar los 500 caracteres.")
        else:
            taller.enlace = enlace

    if creando or "idioma" in datos:
        idioma = datos.get("idioma") or "es"
        if idioma not in ("es", "ca"):
            errores.append("El idioma debe ser español o catalán.")
        else:
            taller.idioma = idioma

    if creando or "estado" in datos:
        estado = datos.get("estado") or "borrador"
        if estado not in ESTADOS_TALLER:
            errores.append("El estado del taller no es válido.")
        else:
            taller.estado = estado

    return errores


@talleres_bp.route("", methods=["GET"])
def listar_talleres_publicos():
    talleres = (
        Taller.query
        .filter(Taller.estado.in_(("publicado", "pospuesto", "cancelado")))
        .order_by(Taller.fecha_inicio.asc())
        .all()
    )
    return jsonify([taller.to_dict() for taller in talleres]), 200


@talleres_bp.route("/<int:taller_id>", methods=["GET"])
def obtener_taller_publico(taller_id):
    taller = db.session.get(Taller, taller_id)

    if taller is None or taller.estado == "borrador":
        return jsonify(error="Taller no encontrado."), 404

    return jsonify(taller.to_dict()), 200


@talleres_bp.route("/gestion", methods=["GET"])
@jwt_required()
def listar_talleres_gestion():
    _, error = _usuario_gestor()
    if error:
        return error

    talleres = Taller.query.order_by(Taller.fecha_inicio.desc()).all()
    return jsonify([taller.to_dict() for taller in talleres]), 200


@talleres_bp.route("", methods=["POST"])
@jwt_required()
def crear_taller():
    usuario, error = _usuario_gestor()
    if error:
        return error

    datos = request.get_json(silent=True) or {}
    taller = Taller(organizador_id=usuario.id)

    errores = _actualizar_taller(taller, datos, creando=True)
    if errores:
        return jsonify(error=" ".join(errores)), 400

    db.session.add(taller)
    db.session.commit()

    return jsonify(taller.to_dict()), 201


@talleres_bp.route("/<int:taller_id>", methods=["PATCH"])
@jwt_required()
def editar_taller(taller_id):
    _, error = _usuario_gestor()
    if error:
        return error

    taller = db.session.get(Taller, taller_id)
    if taller is None:
        return jsonify(error="Taller no encontrado."), 404

    datos = request.get_json(silent=True) or {}
    errores = _actualizar_taller(taller, datos)

    if errores:
        return jsonify(error=" ".join(errores)), 400

    db.session.commit()
    return jsonify(taller.to_dict()), 200


@talleres_bp.route("/<int:taller_id>", methods=["DELETE"])
@jwt_required()
def eliminar_taller(taller_id):
    _, error = _usuario_gestor()
    if error:
        return error

    taller = db.session.get(Taller, taller_id)
    if taller is None:
        return jsonify(error="Taller no encontrado."), 404

    db.session.delete(taller)
    db.session.commit()

    return "", 204
