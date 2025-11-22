from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from datetime import datetime
from bson.objectid import ObjectId

app = Flask(__name__, static_folder="../web")
CORS(app)

# ------------------------ CONFIGURAR MONGO ------------------------
app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# ------------------------ ENDPOINTS ------------------------

# Datos sensores y EC
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        data['timestamp'] = datetime.utcnow().isoformat()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.contador.find({}, {"_id": 0}).sort("timestamp", -1).limit(200))
        return jsonify(datos)

# Crear orden de agua
@app.route('/place_order', methods=['POST'])
def place_order():
    data = request.get_json()
    data['status'] = 'pending'
    data['timestamp'] = datetime.utcnow().isoformat()
    result = mongo.db.orders.insert_one(data)
    return jsonify({"message": "Orden creada", "id": str(result.inserted_id)}), 201

# ESP32 solicita próxima orden pendiente
@app.route('/enviar', methods=['GET'])
def enviar():
    order = mongo.db.orders.find_one_and_update(
        {"status": "pending"},
        {"$set": {"status": "processing", "assigned_at": datetime.utcnow().isoformat()}},
        sort=[("timestamp", 1)],
        return_document=True
    )
    if not order:
        return jsonify({"litros": 0}), 200
    return jsonify({
        "id": str(order["_id"]),
        "litros": float(order.get("litros", 0)),
        "operator": order.get("operator", "maqueta")
    }), 200

# ESP32 reporta envío completado
@app.route('/enviar_agua', methods=['POST'])
def enviar_agua():
    datos = request.get_json()
    datos['timestamp'] = datetime.utcnow().isoformat()
    mongo.db.historialEnvios.insert_one(datos)
    order_id = datos.get("order_id")
    if order_id:
        try:
            mongo.db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": {"status": "done", "completed_at": datetime.utcnow().isoformat()}}
            )
        except:
            pass
    return jsonify({"message": "Envío de agua registrado correctamente"}), 201

# Servir HTML
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ------------------------ RUN ------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
