from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__, static_folder="../web")
CORS(app)

# ------------------------ CONFIGURAR MONGO ------------------------
app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# ------------------------ RUTAS API EXISTENTES ------------------------

# --- Datos de sensores / envío de agua base ---
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        data['timestamp'] = datetime.utcnow().isoformat()
        mongo.db.contador.insert_one(data)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(datos)

# --- Registro de ósmosis (mantiene tus lotes y códigos) ---
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        datos = request.get_json()
        now = datetime.now()
        dia_semana = ["L", "M", "MM", "J", "V", "S", "D"][now.weekday()]
        semana = now.isocalendar()[1]
        mes = now.month
        ano = now.year
        lote = f"{datos.get('lote','01')}-S{datos.get('sistema','1')}-{semana}{mes}{ano}-{dia_semana}"
        datos['codigo_lote'] = lote
        datos['timestamp'] = now.isoformat()
        mongo.db.registros.insert_one(datos)
        return jsonify({"message": "Registro guardado", "codigo_lote": lote}), 201
    else:
        registros = list(mongo.db.registros.find({}, {"_id": 0}))
        return jsonify(registros)

# --- Nuevo registro dedicado solo a ósmosis (histórico técnico) ---
@app.route('/registro_osmosis', methods=['GET', 'POST'])
def registro_osmosis():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.registroOsmosis.insert_one(data)
        return jsonify({"message": "Registro guardado"}), 201
    else:
        registros = list(mongo.db.registroOsmosis.find({}, {"_id": 0}))
        return jsonify(registros)

# ------------------------ NUEVAS RUTAS AGREGADAS ------------------------

# --- Registro de envío de agua con operador (nuevo módulo) ---
@app.route('/enviar_agua', methods=['POST'])
def enviar_agua():
    datos = request.get_json()
    datos['timestamp'] = datetime.utcnow().isoformat()
    mongo.db.historialEnvios.insert_one(datos)
    return jsonify({"message": "Envío de agua registrado correctamente"}), 201

# --- Obtener historial de envíos de agua ---
@app.route('/historial_agua/data', methods=['GET'])
def historial_agua_data():
    registros = list(mongo.db.historialEnvios.find({}, {"_id": 0}))
    return jsonify(registros)

# ------------------------ SERVIR HTML ------------------------

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/monitor')
def serve_monitor():
    return send_from_directory(app.static_folder, "monitor.html")

@app.route('/registro_page')
def serve_registro():
    return send_from_directory(app.static_folder, "registro.html")

@app.route('/historial')
def serve_historial():
    return send_from_directory(app.static_folder, "historial.html")

@app.route('/historial_agua')
def serve_historial_agua():
    return send_from_directory(app.static_folder, "historialagua.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ------------------------ RUN ------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
