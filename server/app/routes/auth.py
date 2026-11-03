from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.extensions import db
from app.models.usuario import Usuario, ROLES_VALIDOS

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/registro", methods=["POST"])
def registro():
    datos = request.get_json(silent=True) or {}

    email = (datos.get("email") or "").strip().lower()
    password = datos.get("password") or ""
    rol = datos.get("rol") or ""
    idioma_preferido = datos.get("idioma_preferido", "es")

    # --- Validaciones ---
    if not email or not password or not rol:
        return jsonify(error="Faltan datos: email, password y rol son obligatorios."), 400

    if len(password) < 8:
        return jsonify(error="La contraseña debe tener al menos 8 caracteres."), 400

    if rol not in ROLES_VALIDOS:
        return jsonify(error=f"Rol inválido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}."), 400

    if Usuario.query.filter_by(email=email).first() is not None:
        return jsonify(error="Ya existe una cuenta registrada con ese email."), 409

    # --- Creación del usuario ---
    nuevo_usuario = Usuario(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
        rol=rol,
        idioma_preferido=idioma_preferido,
    )

    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
    except IntegrityError:
        # Red de seguridad ante una condición de carrera (dos registros
        # con el mismo email casi al mismo tiempo); el email ya es
        # único a nivel de base de datos, esto solo evita un error feo.
        db.session.rollback()
        return jsonify(error="Ya existe una cuenta registrada con ese email."), 409

    return jsonify(
        id=nuevo_usuario.id,
        email=nuevo_usuario.email,
        rol=nuevo_usuario.rol,
        idioma_preferido=nuevo_usuario.idioma_preferido,
    ), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    datos = request.get_json(silent=True) or {}

    email = (datos.get("email") or "").strip().lower()
    password = datos.get("password") or ""

    usuario = Usuario.query.filter_by(email=email).first()

    # Mensaje genérico a propósito: no decimos si falló el email o la
    # contraseña, para no darle pistas a quien intente adivinar cuentas.
    credenciales_invalidas = (usuario is None) or not check_password_hash(
        usuario.password_hash, password
    )
    if credenciales_invalidas:
        return jsonify(error="Email o contraseña incorrectos."), 401

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"rol": usuario.rol},
    )

    return jsonify(
        access_token=token,
        usuario=dict(
            id=usuario.id,
            email=usuario.email,
            nombre=usuario.nombre,
            alias=usuario.alias,
            rol=usuario.rol,
            idioma_preferido=usuario.idioma_preferido,
            disponible=usuario.disponible,
            es_moderador=usuario.es_moderador,
            gestiona_talleres=usuario.gestiona_talleres,
        ),
    ), 200



def _usuario_actual():
    identidad = get_jwt_identity()

    try:
        usuario_id = int(identidad)
    except (TypeError, ValueError):
        return None

    return db.session.get(Usuario, usuario_id)


def _usuario_dict(usuario):
    return {
        "id": usuario.id,
        "email": usuario.email,
        "nombre": usuario.nombre,
        "alias": usuario.alias,
        "rol": usuario.rol,
        "idioma_preferido": usuario.idioma_preferido,
        "disponible": usuario.disponible,
        "es_moderador": usuario.es_moderador,
        "gestiona_talleres": usuario.gestiona_talleres,
    }


@auth_bp.route("/perfil", methods=["GET"])
@jwt_required()
def obtener_perfil():
    usuario = _usuario_actual()

    if usuario is None:
        return jsonify(error="Usuario no encontrado."), 404

    return jsonify(usuario=_usuario_dict(usuario)), 200


@auth_bp.route("/perfil", methods=["PATCH"])
@jwt_required()
def actualizar_perfil():
    usuario = _usuario_actual()

    if usuario is None:
        return jsonify(error="Usuario no encontrado."), 404

    datos = request.get_json(silent=True) or {}

    if "nombre" in datos:
        nombre = (datos.get("nombre") or "").strip() or None

        if nombre and len(nombre) > 100:
            return jsonify(error="El nombre no puede superar los 100 caracteres."), 400

        usuario.nombre = nombre

    if "alias" in datos:
        alias = (datos.get("alias") or "").strip().lower() or None

        if alias:
            if len(alias) < 3 or len(alias) > 40:
                return jsonify(
                    error="El alias debe tener entre 3 y 40 caracteres."
                ), 400

            caracteres_validos = all(
                caracter.isalnum() or caracter in "._-"
                for caracter in alias
            )

            if not caracteres_validos:
                return jsonify(
                    error="El alias solo puede contener letras, números, puntos, guiones y guiones bajos."
                ), 400

            existente = Usuario.query.filter(
                Usuario.alias == alias,
                Usuario.id != usuario.id,
            ).first()

            if existente is not None:
                return jsonify(error="Ese alias ya está siendo utilizado."), 409

        usuario.alias = alias

    if "idioma_preferido" in datos:
        idioma = datos.get("idioma_preferido")

        if idioma not in ("es", "ca"):
            return jsonify(error="El idioma seleccionado no es válido."), 400

        usuario.idioma_preferido = idioma

    if "email" in datos:
        email = (datos.get("email") or "").strip().lower()

        if not email or "@" not in email or len(email) > 120:
            return jsonify(error="Introduce un correo electrónico válido."), 400

        if email != usuario.email:
            password_actual = datos.get("password_actual") or ""

            if not check_password_hash(usuario.password_hash, password_actual):
                return jsonify(
                    error="La contraseña actual no es correcta."
                ), 400

            existente = Usuario.query.filter(
                Usuario.email == email,
                Usuario.id != usuario.id,
            ).first()

            if existente is not None:
                return jsonify(
                    error="Ya existe una cuenta con ese correo electrónico."
                ), 409

            usuario.email = email

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(error="No se pudieron guardar los cambios."), 409

    return jsonify(usuario=_usuario_dict(usuario)), 200


@auth_bp.route("/cambiar-password", methods=["POST"])
@jwt_required()
def cambiar_password():
    usuario = _usuario_actual()

    if usuario is None:
        return jsonify(error="Usuario no encontrado."), 404

    datos = request.get_json(silent=True) or {}
    password_actual = datos.get("password_actual") or ""
    password_nueva = datos.get("password_nueva") or ""
    password_confirmacion = datos.get("password_confirmacion") or ""

    if not check_password_hash(usuario.password_hash, password_actual):
        return jsonify(error="La contraseña actual no es correcta."), 400

    if len(password_nueva) < 8:
        return jsonify(
            error="La nueva contraseña debe tener al menos 8 caracteres."
        ), 400

    if password_nueva != password_confirmacion:
        return jsonify(error="Las contraseñas nuevas no coinciden."), 400

    if check_password_hash(usuario.password_hash, password_nueva):
        return jsonify(
            error="La nueva contraseña debe ser diferente de la actual."
        ), 400

    usuario.password_hash = generate_password_hash(
        password_nueva,
        method="pbkdf2:sha256",
    )
    db.session.commit()

    return jsonify(mensaje="Contraseña actualizada correctamente."), 200


@auth_bp.route("/cuenta", methods=["DELETE"])
@jwt_required()
def eliminar_cuenta():
    usuario = _usuario_actual()

    if usuario is None:
        return jsonify(error="Usuario no encontrado."), 404

    datos = request.get_json(silent=True) or {}
    password_actual = datos.get("password_actual") or ""
    confirmacion = datos.get("confirmacion") or ""

    if not check_password_hash(usuario.password_hash, password_actual):
        return jsonify(error="La contraseña actual no es correcta."), 400

    if confirmacion != "ELIMINAR":
        return jsonify(
            error='Escribe ELIMINAR para confirmar la eliminación.'
        ), 400

    from sqlalchemy import or_
    from app.models.historia import Historia
    from app.models.mensaje import Mensaje
    from app.models.reporte_historia import ReporteHistoria
    from app.models.sesion import Sesion
    from app.models.taller import Taller

    sesiones = Sesion.query.filter(
        or_(
            Sesion.usuario_busca_id == usuario.id,
            Sesion.usuario_voluntario_id == usuario.id,
        )
    ).all()
    sesiones_ids = [sesion.id for sesion in sesiones]

    if sesiones_ids:
        Mensaje.query.filter(
            Mensaje.sesion_id.in_(sesiones_ids)
        ).delete(synchronize_session=False)

        Sesion.query.filter(
            Sesion.id.in_(sesiones_ids)
        ).delete(synchronize_session=False)

    historias = Historia.query.filter_by(usuario_id=usuario.id).all()
    historias_ids = [historia.id for historia in historias]

    if historias_ids:
        ReporteHistoria.query.filter(
            ReporteHistoria.historia_id.in_(historias_ids)
        ).delete(synchronize_session=False)

        Historia.query.filter(
            Historia.id.in_(historias_ids)
        ).delete(synchronize_session=False)

    ReporteHistoria.query.filter_by(
        usuario_id=usuario.id
    ).delete(synchronize_session=False)

    Taller.query.filter_by(
        organizador_id=usuario.id
    ).delete(synchronize_session=False)

    db.session.delete(usuario)
    db.session.commit()

    return "", 204
