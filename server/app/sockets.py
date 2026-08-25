from flask import session
from flask_jwt_extended import decode_token
from flask_socketio import join_room, disconnect

from app.extensions import socketio
from app.models.sesion import Sesion


@socketio.on("connect")
def manejar_conexion(auth):
    """Se ejecuta cuando el navegador abre la conexión WebSocket.

    El cliente debe mandar su token JWT en `auth.token` (no en la URL,
    para no dejarlo en logs). Lo guardamos en la "sesión" propia de
    este socket (distinta de la sesión HTTP normal) para no tener que
    volver a mandarlo en cada evento posterior.
    """
    token = (auth or {}).get("token")
    if not token:
        return False  # rechaza la conexión

    try:
        datos_token = decode_token(token)
        session["usuario_id"] = int(datos_token["sub"])
    except Exception:
        # Cubre tanto un token con firma/vencimiento inválido como uno
        # que, aunque decodifique bien, no tenga el formato esperado
        # (por ejemplo, sin "sub" o con un valor que no es un entero).
        return False


@socketio.on("unirse_sesion")
def manejar_unirse_sesion(datos):
    """El cliente pide "unirse" a una conversación para recibir sus
    mensajes nuevos en vivo. Se valida que sea parte de esa sesión,
    igual que en los endpoints REST — nadie puede escuchar una
    conversación ajena.
    """
    usuario_id = session.get("usuario_id")
    if usuario_id is None:
        disconnect()
        return

    sesion_id = (datos or {}).get("sesion_id")
    sesion = Sesion.query.get(sesion_id) if sesion_id is not None else None

    if sesion is None or not sesion.es_parte(usuario_id):
        return {"ok": False}  # no se une, sin dar más detalles

    join_room(f"sesion_{sesion_id}")
    return {"ok": True}
