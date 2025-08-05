from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()  # .env 파일 읽기
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def generate_ai_response(message):
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 학생들의 고민을 듣고 친절하게 답변하는 학교 AI입니다."},
                {"role": "user", "content": message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"AI 응답 생성 중 오류가 발생했습니다: {e}"
