from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os, json, traceback, uuid, difflib

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# ── 경로(절대) ─────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)              # .../back
ROOT_DIR = os.path.dirname(BASE_DIR)              # 프로젝트 루트
DATA_DIR = os.path.join(ROOT_DIR, "data")
LOG_PATH = os.path.join(DATA_DIR, "logs.json")
LIT_PATH = os.path.join(DATA_DIR, "literacy_logs.json")

def _ensure_file(path: str, default):
	os.makedirs(DATA_DIR, exist_ok=True)
	if not os.path.exists(path):
		with open(path, "w", encoding="utf-8") as f:
			json.dump(default, f, ensure_ascii=False, indent=2)

def save_query(message: str, meta: dict | None = None):
	_ensure_file(LOG_PATH, [])
	try:
		with open(LOG_PATH, "r", encoding="utf-8") as f:
			logs = json.load(f)
	except Exception:
		logs = []
	entry = {
		"message": message,
		"timestamp": datetime.utcnow().isoformat(),
	}
	if meta:
		entry.update({
			"school": meta.get("school"),
			"grade": meta.get("grade"),
			"class": meta.get("class"),
		})
	logs.append(entry)
	with open(LOG_PATH, "w", encoding="utf-8") as f:
		json.dump(logs, f, ensure_ascii=False, indent=2)

def append_literacy_log(entry: dict):
	_ensure_file(LIT_PATH, [])
	try:
		with open(LIT_PATH, "r", encoding="utf-8") as f:
			arr = json.load(f)
	except Exception:
		arr = []
	arr.append(entry)
	with open(LIT_PATH, "w", encoding="utf-8") as f:
		json.dump(arr, f, ensure_ascii=False, indent=2)

@app.get("/health")
def health():
	return "ok", 200

# ── /api/query : AI응답 + 유사질문 ─────────────────────
@app.route("/api/query", methods=["POST", "OPTIONS"])
def api_query():
	if request.method == "OPTIONS":
		return ("", 204)
	data = request.get_json() or {}
	message = (data.get("message") or "").strip()
	if not message:
		return jsonify({"answer": "질문을 입력해 주세요.", "similar_questions": []}), 200

	meta = {
		"school": (data.get("school") or "").strip() or None,
		"grade": (data.get("grade") or "").strip() or None,
		"class": (data.get("class") or "").strip() or None,
	}
	save_query(message, meta)

	try:
		from services.gpt_service import generate_ai_response
	except Exception as e:
		print("!! import gpt_service error:", e)
		traceback.print_exc()
		def generate_ai_response(msg):
			return "AI 응답 생성이 일시적으로 불가합니다. 잠시 후 다시 시도해 주세요."

	try:
		from services.similar_service import recommend_similar_questions
		sims = recommend_similar_questions(message, top_n=3, threshold=0.35, path=LOG_PATH)
	except Exception as e:
		print("!! similar_service error:", e)
		traceback.print_exc()
		sims = []

	answer = generate_ai_response(message)
	return jsonify({"answer": answer, "similar_questions": sims}), 200

# ── /api/trends : 범위 필터 지원 ─────────────────────────
@app.get("/api/trends")
def api_trends():
	try:
		school = (request.args.get("school") or "").strip() or None
		grade = (request.args.get("grade") or "").strip() or None
		klass = (request.args.get("class") or "").strip() or None

		from services.trend_analyzer import get_trending_topics
		topics = get_trending_topics(filters={"school": school, "grade": grade, "class": klass})
		return jsonify({"topics": topics}), 200
	except Exception as e:
		print("!! /api/trends error:", e)
		traceback.print_exc()
		return jsonify({"topics": [], "error": str(e)}), 500

# ── 추천 API(후속 질문 / 카테고리별) ─────────────────────
@app.post("/api/recommend/next")
def api_recommend_next():
	data = request.get_json() or {}
	message = (data.get("message") or "").strip()
	if not message:
		return jsonify({"items": []}), 200
	try:
		from services.recommend_service import recommend_next_questions
		items = recommend_next_questions(message, LOG_PATH, top_n=3, threshold=0.25)
		return jsonify({"items": items}), 200
	except Exception as e:
		print("!! /api/recommend/next error:", e)
		traceback.print_exc()
		return jsonify({"items": []}), 200

@app.get("/api/recommend/by-category")
def api_recommend_by_category():
	category = (request.args.get("category") or "").strip()
	if not category:
		return jsonify({"items": []}), 200
	try:
		from services.recommend_service import recommend_by_category
		items = recommend_by_category(category, LOG_PATH, top_n=5)
		return jsonify({"items": items}), 200
	except Exception as e:
		print("!! /api/recommend/by-category error:", e)
		traceback.print_exc()
		return jsonify({"items": []}), 200

# ── 리터러시(Spot the Lie) ─────────────────────────────
CHALLENGES = {}
CHALLENGE_TTL = timedelta(minutes=30)

def _cleanup_challenges():
	now = datetime.utcnow()
	expired = [k for k,v in CHALLENGES.items() if now - v["created"] > CHALLENGE_TTL]
	for k in expired:
		CHALLENGES.pop(k, None)

def _tokenize(s: str):
	import re
	return re.findall(r"[가-힣A-Za-z0-9]+", s)

def _true_error_tokens(base: str, pert: str):
	b = _tokenize(base)
	p = _tokenize(pert)
	n = min(len(b), len(p))
	errors = []
	for i in range(n):
		if b[i] != p[i]:
			errors.append(p[i])
	if len(p) > n:
		errors.extend(p[n:])
	errors = [t for t in errors if t.strip()]
	return list(dict.fromkeys(errors))

def _similarity(a: str, b: str) -> float:
	return difflib.SequenceMatcher(None, a, b).ratio()

@app.route("/api/literacy/challenge", methods=["POST", "OPTIONS"])
def literacy_challenge():
	if request.method == "OPTIONS":
		return ("", 204)
	data = request.get_json() or {}
	q = (data.get("question") or "").strip()
	if not q:
		return jsonify({"error": "질문을 입력해 주세요."}), 400

	try:
		from services.gpt_service import generate_ai_response
	except Exception:
		def generate_ai_response(msg):  # fallback
			return "기본 응답(임시): 리터러시 체험 데모입니다."
	try:
		from services.literacy_service import inject_small_error, diff_hints
	except Exception:
		def inject_small_error(text): return text
		def diff_hints(o, p): return ["숫자/연도를 살펴보세요."]

	base = generate_ai_response(q)
	pert = inject_small_error(base)

	challenge_id = str(uuid.uuid4())
	_cleanup_challenges()
	CHALLENGES[challenge_id] = {"base": base, "pert": pert, "created": datetime.utcnow()}

	hints = diff_hints(base, pert)
	return jsonify({
		"mode": "spot",
		"challenge_id": challenge_id,
		"question": q,
		"ai_answer": pert,
		"hints": hints
	}), 200

@app.route("/api/literacy/submit", methods=["POST", "OPTIONS"])
def literacy_submit():
	if request.method == "OPTIONS":
		return ("", 204)
	data = request.get_json() or {}

	challenge_id = data.get("challenge_id")
	user_spots = data.get("user_spots", [])   # [{text, reason}]
	final_answer = (data.get("final_answer") or "").strip()
	question = data.get("question")

	if not challenge_id or challenge_id not in CHALLENGES:
		return jsonify({"ok": False, "error": "유효하지 않은 도전입니다. 다시 생성해 주세요."}), 400

	ch = CHALLENGES.get(challenge_id)
	base, pert = ch["base"], ch["pert"]

	gt_errors = _true_error_tokens(base, pert)
	gt_errors_l = [e.lower() for e in gt_errors]

	found, matched = 0, []
	for s in user_spots:
		t = (s.get("text") or "").strip().lower()
		if not t:
			continue
		if any(tok in t for tok in gt_errors_l):
			found += 1
			matched.append(s.get("text"))

	total = max(1, len(gt_errors))
	spot_score = round(100 * found / total, 1)
	sim = round(_similarity(final_answer, base) * 100, 1)
	correct = (spot_score >= 60) or (sim >= 70)

	feedback = {
		"true_errors": gt_errors,
		"matched_spots": matched,
		"spot_score": spot_score,
		"final_sim_to_base": sim,
		"explanation": "표시한 오류와 실제 오류의 일치도, 최종 답변의 정확도를 기준으로 평가했어요."
	}

	append_literacy_log({
		"mode": "spot",
		"question": question,
		"ai_answer": pert,
		"user_spots": user_spots,
		"final_answer": final_answer,
		"score_spot": spot_score,
		"score_similarity": sim,
		"correct": correct,
		"timestamp": datetime.utcnow().isoformat()
	})

	return jsonify({
		"ok": True,
		"correct": correct,
		"score": {"spot": spot_score, "similarity": sim},
		"feedback": feedback
	}), 200

@app.route("/api/literacy/compare", methods=["POST", "OPTIONS"])
def literacy_compare():
	if request.method == "OPTIONS":
		return ("", 204)
	data = request.get_json() or {}
	q = (data.get("question") or "").strip()
	if not q:
		return jsonify({"error": "질문을 입력해 주세요."}), 400

	try:
		from services.gpt_service import generate_ai_response
	except Exception:
		def generate_ai_response(msg):  # fallback
			return "기본 응답(임시): 모델 비교 데모입니다."

	a = generate_ai_response(q)
	b = generate_ai_response(q + " 핵심만 간단히 요약해서 알려줘")
	return jsonify({
		"mode": "compare",
		"question": q,
		"modelA": {"name": "Model A", "answer": a},
		"modelB": {"name": "Model B", "answer": b}
	}), 200

if __name__ == "__main__":
	_ensure_file(LOG_PATH, [])
	_ensure_file(LIT_PATH, [])
	print(">> starting flask...")
	print(app.url_map)
	app.run(debug=True)
