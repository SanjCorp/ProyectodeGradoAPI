from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__, static_folder="../web")
CORS(app)

# Conexión a MongoDB
client = MongoClient("mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/?retryWrites=true&w=majority")
db = client["contadorDB"]
coleccion = db["datos"]

# Ruta para recibir datos del ESP32
@app.route("/contador", methods=["GET", "POST"])
def contador():
    if request.method == "POST":
        data = request.get_json()
        coleccion.insert_one(data)
        return jsonify({"status": "ok"}), 201
    else:
        datos = list(coleccion.find({}, {"_id": 0}))
        return jsonify(datos)

# Servir HTML desde /web
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# Servir otros archivos estáticos (JS, CSS)
@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
