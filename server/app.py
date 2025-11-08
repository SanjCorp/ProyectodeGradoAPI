from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__, static_folder="../web")
CORS(app)

app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        dato = request.get_json()
        # Agrega timestamp si no viene
        if 'timestamp' not in dato:
            dato['timestamp'] = datetime.now().isoformat()
        mongo.db.contador.insert_one(dato)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(datos)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
