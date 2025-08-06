import json
import os
import re
from collections import Counter
from typing import Optional, Dict, Any, List

# 프로젝트 루트 기준 경로 고정
# __file__ = .../back/services/trend_analyzer.py
# dirname -> .../back/services
# dirname -> .../back
# dirname -> .../(project root)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "data")
LOG_PATH = os.path.join(DATA_DIR, "logs.json")

# 규칙 기반(폴백) 카테고리 매핑
KEYWORD_MAP = [
	(r"(시험|공부|숙제|성적|평가|중간|기말|내신)", "시험/학업"),
	(r"(진로|대학|전공|취업|진학|자소서|면접)", "진로/미래"),
	(r"(친구|관계|왕따|따돌림|갈등|연애|사교)", "관계/친구"),
	(r"(동아리|봉사|체험|프로젝트|대회|활동)", "동아리/활동"),
	(r"(스트레스|우울|불안|멘탈|감정|마음|상담)", "정서/상담"),
]

def rule_based_category(text: str) -> str:
	for pat, cat in KEYWORD_MAP:
		if re.search(pat, text):
			return cat
	return "기타"

def _get_openai_client() -> Optional["OpenAI"]:
	"""
	OpenAI 클라이언트를 필요할 때만 만들고, 실패하면 None을 반환.
	(키 없음/쿼터초과/네트워크 이슈 등 대비)
	"""
	try:
		from openai import OpenAI
		from dotenv import load_dotenv
		load_dotenv()
		api_key = os.environ.get("OPENAI_API_KEY")
		if not api_key:
			return None
		return OpenAI(api_key=api_key)
	except Exception:
		return None

def classify_message_with_ai(message: str, client=None) -> str:
	"""
	- OpenAI 호출 시도 → 실패하면 규칙 기반으로 폴백.
	- 한 문장에 대해 한 번만 호출(상위에서 client 재사용 권장).
	"""
	client = client or _get_openai_client()

	if client is not None:
		try:
			resp = client.chat.completions.create(
				model="gpt-3.5-turbo",
				messages=[
					{"role": "system", "content": "너는 학생 고민을 주제별로 분류하는 전문가야."},
					{"role": "user", "content":
						"아래 문장을 읽고, 한 단어 또는 짧은 구절로 카테고리만 출력해. "
						"예시: 시험/학업, 진로/미래, 관계/친구, 동아리/활동, 정서/상담, 기타\n\n"
						f"문장: \"{message}\""
					}
				],
				max_tokens=16,
				temperature=0
			)
			category = (resp.choices[0].message.content or "").strip()
			if not category or len(category) > 30:
				return rule_based_category(message)
			return category
		except Exception:
			return rule_based_category(message)

	# 키 없음 등으로 client가 None이면 바로 폴백
	return rule_based_category(message)

def _should_apply(k: str, v: Any) -> bool:
	if v is None:
		return False
	if isinstance(v, str) and v.strip() == "":
		return False
	return True

def _match_filters(record: Dict[str, Any], active_filters: Dict[str, Any]) -> bool:
	for k, v in active_filters.items():
		rv = record.get(k)
		if str(rv).strip() != str(v).strip():
			return False
	return True

def get_trending_topics(filters: Optional[Dict[str, Any]] = None) -> List[str]:
	"""
	logs.json을 읽어 (옵션) filters로 레코드를 거른 뒤,
	각 message를 분류하여 상위 5개 카테고리를 반환.

	filters 예시: {"school": "A고", "grade": "2", "class": "3"}
	"""
	try:
		with open(LOG_PATH, "r", encoding="utf-8") as f:
			logs = json.load(f)
	except FileNotFoundError:
		return []
	except Exception:
		return []

	if not isinstance(logs, list):
		return []

	# 필터 적용
	if filters:
		active = {k: v for k, v in filters.items() if _should_apply(k, v)}
		if active:
			logs = [log for log in logs if isinstance(log, dict) and _match_filters(log, active)]

	client = _get_openai_client()  # 한 번만 준비(없으면 None)
	categories = []
	for log in logs:
		msg = (log or {}).get("message", "")
		if not msg:
			continue
		cat = classify_message_with_ai(msg, client=client)
		categories.append(cat)

	top_topics = [cat for cat, _ in Counter(categories).most_common(5)]
	return top_topics
