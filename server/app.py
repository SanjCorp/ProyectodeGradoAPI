from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__, static_folder="../web")
CORS(app)

app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Datos de sensores
@app.route('/data', methods=['GET','POST'])
def data():
    if request.method=='POST':
        data = request.get_json()
        data['timestamp'] = datetime.now().isoformat()
        mongo.db.contador.insert_one(data)
        return jsonify({"message":"Dato recibido"}),201
    else:
        datos = list(mongo.db.contador.find({},{"_id":0}))
        return jsonify(datos)

# Enviar agua
@app.route('/enviar', methods=['GET','POST'])
def enviar():
    if request.method=='POST':
        data = request.get_json()
        mongo.db.envios.insert_one({"litros":data["litros"],"timestamp":datetime.now().isoformat()})
        return jsonify({"message":"Orden recibida"}),201
    else:  # GET -> ESP32 consulta
        ultimo = mongo.db.envios.find_one(sort=[("_id",-1)])
        if ultimo and 'litros' in ultimo:
            return jsonify({"litros":ultimo['litros']})
        return jsonify({"litros":0})

# Historial de envíos
@app.route('/envios', methods=['GET'])
def envios():
    datos = list(mongo.db.envios.find({},{"_id":0}))
    return jsonify(datos)

# Registrar osmosis manual
@app.route('/osmosis', methods=['POST'])
def osmosis():
    data = request.get_json()
    data['codigo'] = generar_codigo()
    data['timestamp'] = datetime.now().isoformat()
    mongo.db.osmosis.insert_one(data)
    return jsonify({"message":"Registro guardado","codigo":data['codigo']}),201

# Buscar registro por código
@app.route('/buscar_osmosis/<codigo>', methods=['GET'])
def buscar_osmosis(codigo):
    datos = list(mongo.db.osmosis.find({"codigo":codigo},{"_id":0}))
    return jsonify(datos)

def generar_codigo():
    ahora = datetime.now()
    dia = ahora.strftime('%a')[0].upper()  # L,M,X,J,V,S,D
    semana = ahora.isocalendar()[1]
    lote = "04"  # fijo
    mes = ahora.month
    year = ahora.year
    return f"{lote}-S1-{semana}{mes}{year}-{dia}"

# Servir páginas
@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/monitor')
def monitor():
    return send_from_directory(app.static_folder, "monitor.html")

@app.route('/historial')
def historial():
    return send_from_directory(app.static_folder, "historial.html")

@app.route('/registro')
def registro():
    return send_from_directory(app.static_folder, "registro.html")

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder,path)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
