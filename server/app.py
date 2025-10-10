from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Conexión a MongoDB Atlas
client = MongoClient("mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['ProyectodeGradoAPI']
contador_collection = db['contador']

# Inicializar contador si no existe
if contador_collection.count_documents({}) == 0:
    contador_collection.insert_one({"valor": 0})

@app.route("/get", methods=["GET"])
def get_counter():
    doc = contador_collection.find_one({})
    return jsonify({"contador": doc["valor"]})

@app.route("/add", methods=["POST"])
def add_counter():
    doc = contador_collection.find_one({})
    nuevo_valor = doc["valor"] + 1
    contador_collection.update_one({}, {"$set": {"valor": nuevo_valor}})
    return jsonify({"contador": nuevo_valor})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
