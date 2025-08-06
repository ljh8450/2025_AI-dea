from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

def load_questions(path="data/logs.json"):
    try:
        with open(path, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except FileNotFoundError:
        logs = []
    return [log.get("message", "") for log in logs]

def recommend_similar_questions(new_question, top_n=3, threshold=0.3, path="data/logs.json"):
    questions = load_questions(path)
    if not questions:
        return []
    
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(questions + [new_question])
    sims = cosine_similarity(vectors[-1], vectors[:-1]).flatten()
    
    # 유사도 필터링 + 내림차순 정렬
    filtered = [
        (questions[i], sims[i])
        for i in sims.argsort()[::-1]  # 유사도 높은 순
        if sims[i] >= threshold
    ]
    
    # top_n 개수만 추출
    return [q for q, score in filtered[:top_n]]
