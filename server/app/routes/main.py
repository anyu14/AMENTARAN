from flask import Blueprint, jsonify

# Un Blueprint agrupa rutas relacionadas. Este ("main") es para rutas
# generales del servidor; más adelante crearemos otros (auth, usuarios,
# historias...) y los registraremos igual en app/__init__.py.
main_bp = Blueprint("main", __name__)


@main_bp.route("/api/health")
def health():
    return jsonify(status="ok", mensaje="Amentaran API funcionando")
