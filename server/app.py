from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../web")
CORS(app)

# Conexión MongoDB Atlas
app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        print("📤 Enviando datos a frontend:", len(datos))
        return jsonify(datos)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/monitor')
def serve_monitor():
    return send_from_directory(app.static_folder, "monitor.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    print("🚀 Servidor Flask corriendo en http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
