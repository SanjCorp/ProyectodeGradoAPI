from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# ✅ Conexión con MongoDB
client = MongoClient("mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/?retryWrites=true&w=majority")
db = client["proyectogrado"]
collection = db["contador"]

# ✅ Ruta principal (para probar que la API funciona)
@app.route('/')
def home():
    return jsonify({"message": "✅ API del Proyecto de Grado activa"})

# ✅ Ruta para recibir datos del ESP32
@app.route('/contador', methods=['POST'])
def recibir_datos():
    data = request.get_json()
    print("📩 Datos recibidos:", data)
    if data:
        collection.insert_one(data)
        return jsonify({"status": "ok", "received": data}), 200
    else:
        return jsonify({"status": "error", "message": "No se recibieron datos"}), 400

# ✅ Ruta para ver los datos almacenados
@app.route('/contador', methods=['GET'])
def obtener_datos():
    datos = list(collection.find({}, {"_id": 0}))
    return jsonify(datos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
