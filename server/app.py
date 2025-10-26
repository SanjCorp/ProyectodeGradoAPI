from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../web")
CORS(app)

# Conexión a MongoDB
app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# API de datos
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(datos)

# Página principal
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

# Página del monitor
@app.route('/monitor')
def serve_monitor():
    return send_from_directory(app.static_folder, "monitor.html")

# Servir archivos estáticos (JS, CSS)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
