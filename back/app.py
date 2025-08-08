from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os, json, traceback, uuid, difflib

# 환경변수 불러오기
from dotenv import load_dotenv
import openai

load_dotenv()
key = os.environ.get("OPENAI_API_KEY")
client = openai.OpenAI(api_key=key)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# ── 경로(절대) ─────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "data")
LOG_PATH = os.path.join(DATA_DIR, "logs.json")
LIT_PATH = os.path.join(DATA_DIR, "literacy_logs.json")

# === 세션(채팅방) 저장소 ===
CHAT_DIR = os.path.join(DATA_DIR, "chats")
os.makedirs(CHAT_DIR, exist_ok=True)

def _chat_path(chat_id: str) -> str:
    return os.path.join(CHAT_DIR, f"{chat_id}.json")

def _create_chat_file(title: str) -> str:
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    chat_id = f"chat_{ts}"
    doc = {
        "chat_id": chat_id,
        "title": (title or "새 채팅").strip(),
        "created": datetime.utcnow().isoformat() + "Z",
        "messages": []
    }
    with open(_chat_path(chat_id), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    return chat_id

def _read_chat(chat_id: str) -> dict | None:
    p = _chat_path(chat_id)
    if not os.path.exists(p): return None
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def _write_chat(doc: dict):
    with open(_chat_path(doc["chat_id"]), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
# 1) 채팅방 생성
@app.post("/api/chat/create")
def api_chat_create():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    chat_id = _create_chat_file(title)
    return jsonify({"chat_id": chat_id}), 200

# 2) 채팅방 목록
@app.get("/api/chat/list")
def api_chat_list():
    items = []
    for fn in os.listdir(CHAT_DIR):
        if not fn.endswith(".json"): 
            continue
        try:
            with open(os.path.join(CHAT_DIR, fn), "r", encoding="utf-8") as f:
                c = json.load(f)
            items.append({"chat_id": c["chat_id"], "title": c.get("title") or c["chat_id"]})
        except Exception:
            continue
    # 최신이 위로
    items.sort(key=lambda x: x["chat_id"], reverse=True)
    return jsonify({"chats": items}), 200

# 3) 특정 채팅방 히스토리
@app.get("/api/chat/history")
def api_chat_history():
    chat_id = (request.args.get("chat_id") or "").strip()
    doc = _read_chat(chat_id)
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify({"chat_id": chat_id, "title": doc.get("title"), "messages": doc.get("messages", [])}), 200

# 4) 메시지 전송(+AI 응답 저장)
@app.post("/api/chat/send")
def api_chat_send():
    data = request.get_json() or {}
    chat_id = (data.get("chat_id") or "").strip()
    message = (data.get("message") or "").strip()
    if not chat_id or not message:
        return jsonify({"error": "chat_id and message required"}), 400

    doc = _read_chat(chat_id)
    if not doc:
        return jsonify({"error": "chat not found"}), 404

    # 사용자 메시지 추가
    doc["messages"].append({"role": "user", "content": message})

    # AI 응답
    try:
        from services.gpt_service import generate_ai_response
        answer = generate_ai_response(message)
    except Exception:
        traceback.print_exc()
        answer = "AI 응답 생성 중 오류가 발생했습니다. API 키/네트워크를 확인해주세요."

    # AI 메시지 추가
    doc["messages"].append({"role": "assistant", "content": answer})
    _write_chat(doc)

    # (옵션) 유사 질문
    try:
        from services.similar_service import recommend_similar_questions
        sims = recommend_similar_questions(message, top_n=3, threshold=0.35, path=LOG_PATH)
    except Exception:
        sims = []

    return jsonify({
        "answer": answer,
        "messages": doc["messages"],
        "similar_questions": sims
    }), 200


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

# ── 기존 AI/추천/트렌드 엔드포인트 (그대로 유지) ─────────────────────
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

# ── 리터러시 공통 유틸 ────────────────────────────────
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

# ── Spot the Lie: 챌린지 생성 ─────────────────────────
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
        def generate_ai_response(msg):
            return "기본 응답(임시): 리터러시 체험 데모입니다."

    try:
        from services.literacy_service import inject_semantic_error, diff_hints, compare_and_highlight
    except Exception:
        def inject_semantic_error(text): return text
        def diff_hints(o, p): return ["내용을 비교해 보세요."]
        def compare_and_highlight(base, pert): return []

    base = generate_ai_response(q)
    pert = inject_semantic_error(base)

    # 하이라이트 토큰 계산 (없으면 토큰 비교로 대체)
    highlight_tokens = compare_and_highlight(base, pert) or _true_error_tokens(base, pert)

    challenge_id = str(uuid.uuid4())
    _cleanup_challenges()
    CHALLENGES[challenge_id] = {"base": base, "pert": pert, "created": datetime.utcnow()}

    hints = diff_hints(base, pert)
    return jsonify({
        "mode": "spot",
        "challenge_id": challenge_id,
        "question": q,
        "ai_answer": pert,
        "hints": hints,
        "highlight_tokens": highlight_tokens
    }), 200

# ── Spot the Lie: 제출/채점 ───────────────────────────
@app.route("/api/literacy/submit", methods=["POST", "OPTIONS"])
def literacy_submit():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json() or {}

    challenge_id = data.get("challenge_id")
    user_spots = data.get("user_spots", [])   # [{text, reason}]
    final_answer = (data.get("final_answer") or "").strip()
    question = data.get("question")
    user_id = (data.get("user_id") or "").strip() or "anonymous"
    nickname = (data.get("nickname") or "").strip() or None

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
    final_score = round(0.7 * spot_score + 0.3 * sim, 1)

    feedback = {
        "true_errors": gt_errors,
        "matched_spots": matched,
        "spot_score": spot_score,
        "final_sim_to_base": sim,
        "explanation": "표시한 오류와 실제 오류의 일치도, 최종 답변의 정확도를 기준으로 평가했어요."
    }

    append_literacy_log({
        "mode": "spot",
        "user_id": user_id,
        "nickname": nickname,
        "question": question,
        "ai_answer": pert,
        "user_spots": user_spots,
        "final_answer": final_answer,
        "score_spot": spot_score,
        "score_similarity": sim,
        "final_score": final_score,
        "correct": correct,
        "timestamp": datetime.utcnow().isoformat()
    })

    return jsonify({
        "ok": True,
        "correct": correct,
        "score": {"spot": spot_score, "similarity": sim, "final": final_score},
        "feedback": feedback
    }), 200

# ── Compare ───────────────────────────────────────────
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
        def generate_ai_response(msg):
            return "기본 응답(임시): 모델 비교 데모입니다."

    a = generate_ai_response(q)
    b = generate_ai_response(q + " 핵심만 간단히 요약해서 알려줘")
    return jsonify({
        "mode": "compare",
        "question": q,
        "modelA": {"name": "Model A", "answer": a},
        "modelB": {"name": "Model B", "answer": b}
    }), 200

# ── OX 퀴즈 생성 ──────────────────────────────────────
@app.route("/api/literacy/quiz", methods=["POST", "OPTIONS"])
def literacy_quiz():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json() or {}
    # topic or question 모두 허용
    topic = (data.get("topic") or data.get("question") or "").strip()
    if not topic:
        return jsonify({"error": "주제를 입력해 주세요."}), 400

    try:
        from services.literacy_service import generate_ox_quiz
        items = generate_ox_quiz(topic)  # [{question, answer}, ...]
        return jsonify({"items": items}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "items": []}), 500

# ── OX 퀴즈 채점 ──────────────────────────────────────
@app.route("/api/literacy/quiz-grade", methods=["POST", "OPTIONS"])
def literacy_quiz_grade():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json() or {}

    user_answers = data.get("answers", [])  # [{ question, answer, true_answer }]
    user_id = (data.get("user_id") or "").strip() or "anonymous"
    nickname = (data.get("nickname") or "").strip() or None
    topic = (data.get("topic") or "").strip() or None

    correct = 0
    results = []
    for item in user_answers:
        q = item.get("question", "")
        a = (item.get("answer", "") or "").upper()
        true_answer = (item.get("true_answer", "") or "").upper()
        is_correct = a == true_answer
        if is_correct:
            correct += 1
        results.append({
            "question": q,
            "user_answer": a,
            "true_answer": true_answer,
            "correct": is_correct
        })

    total = len(user_answers)
    final_score = round(100 * correct / max(1, total), 1)

    append_literacy_log({
        "mode": "quiz",
        "user_id": user_id,
        "nickname": nickname,
        "topic": topic,
        "total": total,
        "correct": correct,
        "final_score": final_score,
        "timestamp": datetime.utcnow().isoformat()
    })

    return jsonify({
        "total": total,
        "correct": correct,
        "score": final_score,
        "results": results
    }), 200

# ── 리더보드 ──────────────────────────────────────────
def _parse_iso(ts: str):
    try:
        return datetime.fromisoformat(ts.replace("Z",""))
    except:
        return None

@app.get("/api/literacy/leaderboard")
def literacy_leaderboard():
    """
    params:
      mode=spot|quiz|all (default all)
      window=7d|30d|all (default 30d)
      top=10
      (선택) school/grade/class 필터 (로그에 있을 때만 의미)
    """
    from collections import defaultdict

    mode = (request.args.get("mode") or "all").lower()
    window = (request.args.get("window") or "30d").lower()
    top = int(request.args.get("top") or 10)
    school = request.args.get("school")
    grade = request.args.get("grade")
    klass = request.args.get("class")

    # 기간
    now = datetime.utcnow()
    if window == "7d":
        since = now - timedelta(days=7)
    elif window == "30d":
        since = now - timedelta(days=30)
    else:
        since = datetime(1970,1,1)

    _ensure_file(LIT_PATH, [])
    try:
        with open(LIT_PATH, "r", encoding="utf-8") as f:
            arr = json.load(f)
    except Exception:
        arr = []

    names = {}  # user_id -> last nickname
    rows = []

    for e in arr:
        ts = _parse_iso(e.get("timestamp",""))
        if not ts or ts < since:
            continue
        if mode != "all" and e.get("mode") != mode:
            continue
        # 선택: school/grade/class가 로그에 있다면 필터 (현 코드에선 미사용)
        if school and e.get("school") and e.get("school") != school: 
            continue
        if grade and e.get("grade") and str(e.get("grade")) != str(grade):
            continue
        if klass and e.get("class") and str(e.get("class")) != str(klass):
            continue

        score = e.get("final_score")
        if score is None and e.get("mode") == "spot":
            s, sim = e.get("score_spot"), e.get("score_similarity")
            if isinstance(s,(int,float)) and isinstance(sim,(int,float)):
                score = round(0.7*s + 0.3*sim, 1)

        if isinstance(score,(int,float)):
            uid = e.get("user_id") or "anonymous"
            rows.append({"user_id": uid, "score": float(score)})
            nn = e.get("nickname")
            if nn:
                names[uid] = nn

    # 집계: 평균
    agg = defaultdict(list)
    for r in rows:
        agg[r["user_id"]].append(r["score"])

    ranking = []
    for uid, scores in agg.items():
        avg = sum(scores)/len(scores)
        ranking.append({
            "user_id": uid,
            "display_name": names.get(uid, uid),
            "avg_score": round(avg,1),
            "plays": len(scores)
        })

    ranking.sort(key=lambda x: (-x["avg_score"], -x["plays"], x["user_id"]))
    return jsonify({"items": ranking[:top]}), 200

#----Side Bar Chat List Delete
@app.post("/api/chat/delete")
def api_chat_delete():
    data = request.get_json() or {}
    chat_id = (data.get("chat_id") or "").strip()
    if not chat_id:
        return jsonify({"ok": False, "error": "chat_id required"}), 400

    path = _chat_path(chat_id)
    if not os.path.exists(path):
        return jsonify({"ok": False, "error": "not found"}), 404

    try:
        os.remove(path)
        return jsonify({"ok": True}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500
    
    
if __name__ == "__main__":
    _ensure_file(LOG_PATH, [])
    _ensure_file(LIT_PATH, [])
    print(">> starting flask...")
    print(app.url_map)
    app.run(debug=True)
