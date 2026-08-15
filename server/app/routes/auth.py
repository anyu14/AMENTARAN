from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token

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
            rol=usuario.rol,
            idioma_preferido=usuario.idioma_preferido,
        ),
    ), 200
