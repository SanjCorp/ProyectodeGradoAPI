from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

contador = 0

@app.route("/get", methods=["GET"])
def get_counter():
    return jsonify({"contador": contador})

@app.route("/add", methods=["POST"])
def add_counter():
    global contador
    contador += 1
    return jsonify({"contador": contador})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
