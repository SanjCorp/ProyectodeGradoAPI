from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="web")  # <-- carpeta web
CORS(app)

app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Rutas de datos del ESP32
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:  # GET
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(datos)

# Ruta para servir el HTML
@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

# Servir archivos estáticos (JS, CSS)
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
