# server/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
from datetime import datetime
from bson import ObjectId
import os

# -----------------------
# Config
# -----------------------
app = Flask(__name__, static_folder="../web")
CORS(app)

MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://RicardoSanjines:RicardoSanjines@cluster0.rhtbcma.mongodb.net/contadorDB?retryWrites=true&w=majority")
API_KEY = os.environ.get("API_KEY", "mi_api_key_de_prueba")  # cambia en prod

app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)

# -----------------------
# Helpers
# -----------------------
def doc_to_json(doc):
    if not doc:
        return None
    res = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            res[k] = str(v)
        else:
            res[k] = v
    return res

def require_api_key(req):
    # check header 'x-api-key' if API_KEY configured (if empty -> skip)
    if not API_KEY:
        return True
    key = req.headers.get("x-api-key")
    return key == API_KEY

# -----------------------
# API: data (ya existente) - reciben mediciones EC/contador
# -----------------------
@app.route('/data', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        payload = request.get_json(force=True)
        # add timestamp server-side if not provided
        if "timestamp" not in payload:
            payload["timestamp"] = datetime.utcnow().isoformat()
        mongo.db.contador.insert_one(payload)
        return jsonify({"message": "Dato recibido"}), 201
    else:
        docs = list(mongo.db.contador.find({}, {"_id": 0}))
        return jsonify(docs)

# -----------------------
# SEND WATER: create/list/cancel orders + updates from ESP
# -----------------------
@app.route('/send_request', methods=['POST'])
def create_send_request():
    if not require_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    payload = request.get_json(force=True)
    try:
        target = float(payload.get("target", 0))
    except:
        return jsonify({"error": "target invalid"}), 400
    device = payload.get("device", "default")
    note = payload.get("note", "")
    doc = {
        "device": device,
        "target": target,
        "accumulated": 0.0,
        "status": "pending",  # pending | running | done | cancelled
        "note": note,
        "created_at": datetime.utcnow().isoformat()
    }
    res = mongo.db.send_requests.insert_one(doc)
    doc_out = doc_to_json({**doc, "_id": res.inserted_id})
    return jsonify(doc_out), 201

@app.route('/send_request/active', methods=['GET'])
def get_active_request():
    device = request.args.get("device", "default")
    # try running first
    req = mongo.db.send_requests.find_one({"device": device, "status": "running"})
    if not req:
        # oldest pending
        req = mongo.db.send_requests.find_one({"device": device, "status": "pending"}, sort=[("created_at", 1)])
    if not req:
        return jsonify({}), 200
    out = doc_to_json(req)
    return jsonify(out), 200

@app.route('/send_update', methods=['POST'])
def send_update():
    if not require_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    payload = request.get_json(force=True)
    device = payload.get("device", "default")
    try:
        delta = float(payload.get("delta", 0.0))
    except:
        delta = 0.0

    # find running then pending -> mark running
    req = mongo.db.send_requests.find_one_and_update(
        {"device": device, "status": {"$in": ["running", "pending"]}},
        {"$set": {"status": "running"}},
        return_document=False
    )
    if not req:
        return jsonify({"error": "No active request"}), 404

    # update accumulated
    new_acc = (req.get("accumulated", 0.0) or 0.0) + delta
    mongo.db.send_requests.update_one({"_id": req["_id"]}, {"$set": {"accumulated": new_acc}})

    # save history
    hist = {
        "request_id": str(req["_id"]),
        "device": device,
        "delta": delta,
        "accumulated": new_acc,
        "timestamp": datetime.utcnow().isoformat()
    }
    mongo.db.send_history.insert_one(hist)

    # check complete
    if new_acc >= float(req.get("target", 0.0)):
        mongo.db.send_requests.update_one({"_id": req["_id"]}, {"$set": {"status": "done", "completed_at": datetime.utcnow().isoformat()}})

    return jsonify({"accumulated": new_acc, "target": req.get("target")}), 200

@app.route('/send_request/cancel', methods=['POST'])
def cancel_request():
    if not require_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    payload = request.get_json(force=True)
    request_id = payload.get("request_id")
    device = payload.get("device")
    if request_id:
        # stored _id is ObjectId -> try to update by string
        try:
            from bson import ObjectId as OId
            mongo.db.send_requests.update_one({"_id": OId(request_id)}, {"$set": {"status": "cancelled"}})
        except:
            mongo.db.send_requests.update_one({"_id": request_id}, {"$set": {"status": "cancelled"}})
    elif device:
        mongo.db.send_requests.update_many({"device": device, "status": {"$in": ["pending", "running"]}}, {"$set": {"status": "cancelled"}})
    return jsonify({"ok": True})

@app.route('/send_history', methods=['GET'])
def get_send_history():
    docs = list(mongo.db.send_history.find({}, {"_id": 0}).sort("timestamp", 1))
    return jsonify(docs)

@app.route('/send_requests', methods=['GET'])
def list_requests():
    docs = list(mongo.db.send_requests.find({}).sort("created_at", -1))
    # convert ObjectId to str
    out = []
    for d in docs:
        dd = doc_to_json(d)
        out.append(dd)
    return jsonify(out)

# -----------------------
# LEVEL endpoints
# -----------------------
@app.route('/level', methods=['POST'])
def post_level():
    if not require_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    payload = request.get_json(force=True)
    device = payload.get("device", "default")
    try:
        level = float(payload.get("level", 0.0))
    except:
        level = 0.0
    doc = {"device": device, "level": level, "timestamp": datetime.utcnow().isoformat()}
    mongo.db.levels.insert_one(doc)
    mongo.db.levels_last.update_one({"device": device}, {"$set": {"level": level, "timestamp": doc["timestamp"]}}, upsert=True)
    return jsonify({"ok": True}), 201

@app.route('/level/last', methods=['GET'])
def get_last_level():
    device = request.args.get("device", "default")
    doc = mongo.db.levels_last.find_one({"device": device}, {"_id": 0})
    return jsonify(doc or {})

# -----------------------
# MACHINES (6x2)
# -----------------------
@app.route('/machines', methods=['POST'])
def create_machine_entry():
    if not require_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    payload = request.get_json(force=True)
    lote = payload.get("lote", "01")
    semana = payload.get("semana", "1")
    mes = payload.get("mes", "")
    anio = payload.get("anio", "")
    diaChar = payload.get("diaChar", "L")
    rowData = payload.get("rowData", [])

    # code format: "04-s1-1125-L" (user builds components)
    code = f"{str(lote).zfill(2)}-s{semana}-{mes}{anio}-{diaChar}"

    doc = {"code": code, "lote": lote, "semana": semana, "mes": mes, "anio": anio, "dia": diaChar, "rowData": rowData, "created_at": datetime.utcnow().isoformat()}
    res = mongo.db.machines.insert_one(doc)
    doc_out = doc_to_json({**doc, "_id": res.inserted_id})
    return jsonify(doc_out), 201

@app.route('/machines', methods=['GET'])
def list_machines():
    docs = list(mongo.db.machines.find({}, {"_id": 0}))
    return jsonify(docs)

# -----------------------
# HTML routes (preserve current)
# -----------------------
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/monitor')
def serve_monitor():
    return send_from_directory(app.static_folder, "monitor.html")

@app.route('/send-history')
def serve_send_history():
    return send_from_directory(app.static_folder, "send-history.html")

@app.route('/machines-page')
def serve_machines_page():
    return send_from_directory(app.static_folder, "machines.html")

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# -----------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
