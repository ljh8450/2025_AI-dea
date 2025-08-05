import json
from collections import Counter
import re

def get_trending_topics():
	try:
		with open("data/logs.json", "r", encoding="utf-8") as f:
			logs = json.load(f)
	except FileNotFoundError:
		return []

	all_messages = " ".join([log["message"] for log in logs])
	keywords = extract_keywords(all_messages)
	top_topics = [kw for kw, _ in Counter(keywords).most_common(5)]
	return top_topics

def extract_keywords(text):
	# 간단한 형태소 기반 키워드 추출 (불용어 제거 포함 가능)
	words = re.findall(r'\b[가-힣a-zA-Z]{2,}\b', text)
	stopwords = ["입니다", "무엇", "어떻게", "많이", "하고", "있어요", "하세요", "정도", "같아요"]
	keywords = [w for w in words if w not in stopwords]
	return keywords
