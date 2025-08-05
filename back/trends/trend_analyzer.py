import json
import os
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def classify_message_with_ai(message):
    prompt = f"""
    너는 학생들의 고민을 분석하는 학교 상담 AI야.
    아래 문장을 읽고, 가장 적절한 카테고리를 한 단어 또는 짧은 구절로 제시해.
    카테고리는 예시를 참고하고, 없으면 새로운 카테고리를 만들어도 돼.
    
    예시 카테고리:
    - 시험/학업
    - 진로/미래
    - 관계/친구
    - 동아리/활동
    - 기타
    
    문장: "{message}"
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "너는 학생 고민을 주제별로 분류하는 전문가야."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=20,
            temperature=0
        )
        category = response.choices[0].message.content.strip()
        return category
    except Exception as e:
        return "기타"

def get_trending_topics():
    try:
        with open("data/logs.json", "r", encoding="utf-8") as f:
            logs = json.load(f)
    except FileNotFoundError:
        return []

    categories = [classify_message_with_ai(log["message"]) for log in logs]
    top_topics = [cat for cat, _ in Counter(categories).most_common(5)]
    return top_topics
