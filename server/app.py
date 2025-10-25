from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "tu_uri_de_mongodb"
mongo = PyMongo(app)

@app.route('/data', methods=['POST'])
def recibir_dato():
    data = request.get_json()
    mongo.db.contador.insert_one(data)
    return jsonify({"message": "Dato recibido"}), 200

@app.route('/data', methods=['GET'])
def obtener_datos():
    datos = list(mongo.db.contador.find({}, {"_id": 0}))
    return jsonify(datos)

if __name__ == '__main__':
    app.run()
