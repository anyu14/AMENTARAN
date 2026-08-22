from app import create_app
from app.extensions import socketio

app = create_app()

if __name__ == "__main__":
    # socketio.run() en vez de app.run(): es quien de verdad sabe
    # manejar tanto las peticiones HTTP normales como las conexiones
    # WebSocket sobre el mismo servidor de desarrollo.
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
