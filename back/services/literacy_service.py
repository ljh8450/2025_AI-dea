import random, re

def inject_small_error(text:str) -> str:
    # 아주 단순한 오류 삽입 규칙 예시 (데모용)
    # 연도 바꾸기, 수치 +1, 고유명사 한 글자 치환 등
    # 안전: 과도한 왜곡은 피하고 1~2곳만
    year_pat = re.search(r"(19|20)\d{2}", text)
    if year_pat:
        y = int(year_pat.group())
        return text.replace(str(y), str(y+1), 1)
    num_pat = re.search(r"\b(\d{1,3})\b", text)
    if num_pat:
        n = int(num_pat.group(1))
        return text.replace(str(n), str(n+1), 1)
    # 마지막 fallback: 단어 하나 바꾸기
    return text.replace("는 ", "은 ", 1)

def diff_hints(original:str, perturbed:str) -> list:
    # 간단한 힌트 포인트 (데모)
    return ["연도/숫자 부분을 특히 주의해서 비교해 보세요."]
