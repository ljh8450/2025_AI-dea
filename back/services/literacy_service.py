# services/literacy_service.py
import os, json, re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def _strip_code_fences(s: str) -> str:
    """ ```json ... ``` 같은 코드펜스 제거 """
    s = s.strip()
    if s.startswith("```"):
        s = s.strip("`")
        # 첫 줄에 json 같은 언급 제거
        parts = s.split("\n", 1)
        s = parts[1] if len(parts) > 1 else parts[0]
    return s.strip()

def _extract_json_array(s: str):
    """문자열에서 JSON 배열 부분만 안전하게 추출"""
    s = _strip_code_fences(s)
    # 1) 바로 배열 형태 시도
    try:
        data = json.loads(s)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            # {"items":[...]} 또는 {"data":[...]} 케이스 지원
            if isinstance(data.get("items"), list):
                return data["items"]
            if isinstance(data.get("data"), list):
                return data["data"]
    except Exception:
        pass

    # 2) 텍스트 중 배열만 골라내기
    start = s.find("[")
    end = s.rfind("]")
    if start != -1 and end != -1 and end > start:
        try:
            arr = json.loads(s[start:end+1])
            if isinstance(arr, list):
                return arr
        except Exception:
            pass
    return None

def _normalize_quiz_items(items):
    """각 항목이 {'question': str, 'answer': 'O'/'X'} 형태인지 검증/정규화"""
    norm = []
    if not isinstance(items, list):
        return norm
    for it in items:
        if not isinstance(it, dict):
            continue
        q = (it.get("question") or "").strip()
        a = (it.get("answer") or "").strip().upper()
        if q and a in ("O", "X"):
            norm.append({"question": q, "answer": a})
    return norm

def generate_ox_quiz(topic: str) -> list[dict]:
    """
    주제 기반 OX 퀴즈 3~5개 생성.
    어떤 경우에도 리스트를 반환하도록 강력한 폴백 포함.
    """
    system = "너는 학생용 OX 퀴즈를 만드는 도우미야."
    user = (
        f"'{topic}' 주제로 사실 기반 OX 퀴즈 3~5개를 만들어.\n"
        "반드시 JSON만 출력해. 설명/문장/코드펜스 금지.\n"
        '형식: [{"question":"...", "answer":"O" 또는 "X"}, ...]'
    )

    # 1차 시도: 최신 모델 (일반 텍스트 JSON)
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o-mini",  # 없으면 gpt-4o-mini 대신 사용 가능한 모델로
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            temperature=0.4,
            max_tokens=400,
        )
        raw = (resp.choices[0].message.content or "").strip()
        print("[quiz raw 1st]:", raw[:300])
        items = _extract_json_array(raw)
        norm = _normalize_quiz_items(items)
        if norm:
            return norm
    except Exception as e:
        print("!! quiz first call error:", repr(e))

    # 2차 시도: 범용 모델 + 더 빡센 지시
    try:
        resp2 = _client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user + "\n다시: JSON 배열만 출력해."}
            ],
            temperature=0.3,
            max_tokens=400,
        )
        raw2 = (resp2.choices[0].message.content or "").strip()
        print("[quiz raw 2nd]:", raw2[:300])
        items2 = _extract_json_array(raw2)
        norm2 = _normalize_quiz_items(items2)
        if norm2:
            return norm2
    except Exception as e2:
        print("!! quiz second call error:", repr(e2))

    # 3차: 최종 안전망(최소 3문항 생성해서 UI가 빈 화면이 되지 않도록)
    fallback = [
        {"question": f"{topic}은/는 항상 과학적으로 입증된 사실만을 포함한다.", "answer": "X"},
        {"question": f"{topic}과/와 관련된 주장을 평가할 때는 출처 확인이 중요하다.", "answer": "O"},
        {"question": f"{topic}은/는 모든 상황에서 동일하게 적용된다.", "answer": "X"},
    ]
    return fallback
