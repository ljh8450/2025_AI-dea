# On_AIr — 교내 AI 채널

학생들이 AI에게 질문하고, 학급·학교·전국 단위의 관심사 흐름을 살펴보며,  
유사 질문과 추천 질문을 통해 더 풍부하게 탐색할 수 있는 **AI 소통·분석 플랫폼**입니다.

---

## 1. 프로젝트 소개

**On_AIr**는 학교 구성원들이 AI와 자연스럽게 소통하면서,  
질문 데이터를 기반으로 관심사 트렌드를 확인하고  
AI 리터러시를 체험할 수 있도록 만든 서비스입니다.

단순한 챗봇을 넘어,

- 질문 기록을 바탕으로 트렌드를 분석하고
- 비슷한 질문 및 다음 질문을 추천하며
- AI 응답을 비판적으로 읽는 리터러시 기능까지 제공하는

**교내 맞춤형 AI 채널 플랫폼**을 목표로 합니다.

---

## 2. 주요 기능

### AI 대화
- 사용자가 질문을 입력하면 AI 응답을 생성
- 채팅방 단위로 대화 기록 저장
- 이전 채팅 내역 조회 및 삭제 가능

### 질문 추천
- 기존 로그를 기반으로 **유사 질문 추천**
- 현재 질문과 관련된 **다음 질문 추천**
- 카테고리별 추천 질문 제공

### 트렌드 분석
- 질문 로그를 기반으로 관심 주제 추출
- **학급 / 학교 / 전체 단위** 트렌드 조회 가능
- 학교, 학년, 반 조건에 따라 필터링 가능

### AI 리터러시 체험
- **Spot the Lie**: AI 응답 속 오류를 찾는 활동
- **Model Compare**: 두 가지 응답을 비교하며 판단하는 활동
- **OX 퀴즈**: 주제 기반 리터러시 퀴즈 제공
- **리더보드**: 사용자별 체험 점수 집계

---

## 3. 기술 스택

### Backend
- Python 3.10+
- Flask
- Flask-CORS
- python-dotenv
- OpenAI API

### Frontend
- React
- Node.js 18+

### Data Storage
- JSON 파일 기반 저장
  - `data/logs.json`
  - `data/literacy_logs.json`
  - `data/chats/*.json`

---

## 4. 프로젝트 구조

```text
project-root/
├─ back/                         # Flask 백엔드
│  ├─ app.py
│  ├─ services/
│  │  ├─ gpt_service.py
│  │  ├─ similar_service.py
│  │  ├─ recommend_service.py
│  │  ├─ trend_analyzer.py
│  │  └─ literacy_service.py
│  └─ venv/                     # 로컬 가상환경
│
├─ front/                       # React 프론트엔드
│  ├─ src/
│  └─ package.json
│
└─ data/                        # 질문/리터러시/채팅 로그 저장
   ├─ logs.json
   ├─ literacy_logs.json
   └─ chats/
```

## 5. 실행 환경

Backend: Python 3.10 이상

Frontend: Node.js 18 이상

운영 방식: 로컬 파일(JSON) 기반 데이터 저장

## 6. 실행 방법
### 1) 백엔드 실행
```bash
# 프로젝트 루트에서 back 폴더로 이동
cd back

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
# Windows (PowerShell)
.\venv\Scripts\Activate

# Mac / Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python app.py
```

기본적으로 Flask 서버가 실행되며, 예시 health check는 아래에서 확인할 수 있습니다.

```bash
GET /health
```
### 2) 프론트엔드 실행

```bash
# 프로젝트 루트에서 front 폴더로 이동
cd front

# 의존성 설치
npm install

# 개발 서버 실행
npm start
3) OpenAI API Key 설정
```

백엔드 폴더 내부에 .env 파일을 생성한 뒤 아래 내용을 입력합니다.

```bash
# back/.env
OPENAI_API_KEY=your_openai_api_key_here
```

## 7. 주요 API 예시
### 채팅
- POST /api/chat/create : 채팅방 생성
- GET /api/chat/list : 채팅방 목록 조회
- GET /api/chat/history : 특정 채팅방 기록 조회
- POST /api/chat/send : 메시지 전송 및 AI 응답 저장
- POST /api/chat/delete : 채팅방 삭제

### 질문 / 추천 / 트렌드
- POST /api/query : 일반 AI 질의
- GET /api/trends : 트렌드 조회
- POST /api/recommend/next : 다음 질문 추천
- GET /api/recommend/by-category : 카테고리별 추천

### AI 리터러시
- POST /api/literacy/challenge : Spot the Lie 문제 생성
- POST /api/literacy/submit : Spot the Lie 제출 및 채점
- POST /api/literacy/compare : 모델 비교 응답 생성
- POST /api/literacy/quiz : OX 퀴즈 생성
- POST /api/literacy/quiz-grade : OX 퀴즈 채점
- GET /api/literacy/leaderboard : 리더보드 조회

## 8. 데이터 저장 방식

이 프로젝트는 프로토타입 단계로써, 별도의 DB 대신 JSON 파일 기반 저장 방식을 사용합니다.

### 저장 파일
- logs.json: 일반 사용자 질문 로그 저장
- literacy_logs.json: AI 리터러시 활동 결과 저장
- chats/{chat_id}.json: 채팅방별 대화 이력 저장

### 장점
- 초기 개발이 간단함
- 구조를 빠르게 실험할 수 있음
- 로컬 환경에서 바로 테스트 가능

### 한계
- 데이터가 많아질수록 성능 저하 가능
- 동시성 처리에 취약
- 운영 환경에서는 DB 전환 필요

## 9. 기대 효과
- 학생들이 AI를 단순 사용 도구가 아니라 탐색과 학습의 도구로 활용할 수 있음
- 질문 데이터를 기반으로 학교 내 관심사 흐름을 파악할 수 있음
- AI 응답을 그대로 믿지 않고 비교·판단하는 AI 리터러시 역량을 기를 수 있음

## 10. 향후 개선 방향
- JSON 저장 방식에서 DB 기반 구조로 확장
- 사용자 인증 및 권한 관리 추가
- 학교/학년/반 단위 통계 시각화 강화
- 리터러시 평가 정확도 개선
- 관리자용 대시보드 기능 확장

## 11. Contributors
- Backend: 이정환
- Frontend: 박윤수
- Design / PM: 김재호
