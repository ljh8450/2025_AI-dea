from openai import OpenAI
import os
from dotenv import load_dotenv, find_dotenv, dotenv_values

# 1) .env 경로/내용 확인 + 오래된 프로세스 값 제거
path = find_dotenv(usecwd=True)
print("[DEBUG] dotenv path:", path)
print("[DEBUG] .env file value:", dotenv_values(path).get("OPENAI_API_KEY"))
os.environ.pop("OPENAI_API_KEY", None)

# 2) .env 강제 로드 (이미 설정된 값도 덮어쓰기)
load_dotenv(dotenv_path=path, override=True)

# 3) 최종 환경값 확인 후 클라이언트 생성 (여기서 만들어야 함)
key = os.environ.get("OPENAI_API_KEY")
print("현재 경로:", os.getcwd())
print(f"[DEBUG] 불러온 API 키: {repr(key)}")
client = OpenAI(api_key=key)

def generate_ai_response(message: str) -> str:
	try:
		completion = client.chat.completions.create(
			model="gpt-3.5-turbo",
			messages=[
				{"role": "system", "content": "당신은 학생들의 고민을 듣고 친절하게 답변하는 학교 AI입니다."},
				{"role": "user", "content": message}
			],
			max_tokens=500,
			temperature=0.7,
		)
		return completion.choices[0].message.content
	except Exception as e:
		return f"AI 응답 생성 중 오류가 발생했습니다: {e}"
