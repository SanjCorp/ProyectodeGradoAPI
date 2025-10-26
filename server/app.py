from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../web")  # Carpeta donde están index.html, script.js
CORS(app)

# Configurar MongoDB
app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Ruta para API de datos
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:  # GET
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(datos)

# Ruta para servir HTML en la raíz
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

# Para servir JS y CSS
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
