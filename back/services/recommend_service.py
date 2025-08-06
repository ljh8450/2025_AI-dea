# back/services/recommend_service.py
import json, os, random
from collections import Counter
from services.trend_analyzer import rule_based_category
from services.similar_service import load_questions
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_next_questions(message: str, path: str, top_n=3, threshold=0.25):
    """ 사용자가 막 한 질문을 기준으로 '다음에 물어볼' 유사/연관 질문 추천 """
    qs = load_questions(path)
    if not qs:
        return []
    vec = TfidfVectorizer().fit_transform(qs + [message])
    sims = cosine_similarity(vec[-1], vec[:-1]).flatten()
    order = sims.argsort()[::-1]
    # 자기자신과 너무 유사한 문장 제외, 임계값 필터
    out = []
    for i in order:
        if sims[i] < threshold: break
        if qs[i].strip() == message.strip(): 
            continue
        out.append(qs[i])
        if len(out) >= top_n: break
    # 데이터가 부족하면 랜덤 보강
    if len(out) < top_n:
        remain = [q for q in qs if q not in out and q.strip() != message.strip()]
        out += random.sample(remain, k=min(top_n - len(out), len(remain)))
    return out[:top_n]

def recommend_by_category(category: str, path: str, top_n=5):
    """ 카테고리로 필터해 대표 질문 추천 """
    try:
        with open(path, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except FileNotFoundError:
        return []
    bucket = []
    for log in logs:
        msg = (log or {}).get("message", "")
        if not msg: 
            continue
        if rule_based_category(msg) == category:
            bucket.append(msg)
    if not bucket:
        return []
    # 많이 나온 질문 유사 텍스트(간이): 빈도 상위
    counts = Counter(bucket).most_common(top_n * 2)
    # 너무 중복되지 않게 앞에서 top_n만
    return [q for q, _ in counts[:top_n]]
