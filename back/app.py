from flask import Flask, request, jsonify
from flask_cors import CORS
from services.gpt_service import generate_ai_response
from trends.trend_analyzer import get_trending_topics

import json
from datetime import datetime

def save_query(message):
	log_path = 'data/logs.json'
	try:
		with open(log_path, 'r', encoding='utf-8') as f:
			logs = json.load(f)
	except FileNotFoundError:
		logs = []

	logs.append({
		"message": message,
		"timestamp": datetime.utcnow().isoformat()
	})

	with open(log_path, 'w', encoding='utf-8') as f:
		json.dump(logs, f, ensure_ascii=False, indent=2)


app = Flask(__name__)
CORS(app)  # 프론트엔드 연결 허용

@app.route("/api/query", methods=["POST"])
def query():
	data = request.get_json()
	message = data.get("message", "")
	save_query(message)
	answer = generate_ai_response(message)
	return jsonify({"answer": answer})

@app.route("/api/trends", methods=["GET"])
def trends():
    topics = get_trending_topics()
    return jsonify({"topics": topics})

if __name__ == "__main__":
    app.run(debug=True)

