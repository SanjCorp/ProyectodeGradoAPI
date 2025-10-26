from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority"
mongo = PyMongo(app)

@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        mongo.db.ec.insert_one(data)  # guardamos en colección "ec"
        return jsonify({"message": "Dato recibido"}), 201
    else:
        datos = list(mongo.db.ec.find({}, {"_id": 0}))
        return jsonify(datos)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
