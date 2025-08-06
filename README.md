# 📡 On_AIr — 교내 AI 채널

## 개요

학생들이 AI를 통해 질문하고, 학급·학교·전국 단위의 관심사 트렌드를 확인하며
유사 질문과 추천 질문을 받아볼 수 있는 **AI 소통·분석 플랫폼**입니다.

- 🗨 AI 대화 + 유사 질문 추천
- 📈 학급/학교/전국 단위 트렌드 분석
- 🎯 카테고리별 질문 추천
- 🧠 AI 리터러시 체험 (Spot the Lie / Model Compare)
- 🏫 학교·학년·반별 트렌드 조회 가능

---

## ⚙ 실행 환경

- **백엔드**: Python 3.10+ / Flask
- **프론트엔드**: Node.js 18+ / React (CRA)
- **DB**: JSON 파일 저장 방식 (`data/logs.json` 등)

---

## 📂 디렉토리 구조

project-root/
├─ back/ # Flask 백엔드
│ ├─ app.py
│ ├─ services/
│ └─ venv/ # 가상환경 (로컬에서 생성)
├─ front/ # React 프론트엔드
│ ├─ src/
│ └─ package.json
└─ data/ # 로그 및 분석 데이터
├─ logs.json
└─ literacy_logs.json

---

## 🚀 실행 방법

### 1) 백엔드 실행

```bash
# 프로젝트 루트에서 back 폴더로 이동
cd back

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
# Windows (PowerShell)
.\venv\Scripts\Activate
# Mac/Linux
source venv/bin/activate

# 필요한 라이브러리 설치
pip install -r requirements.txt

# 서버 실행
python app.py

```

### 2) 백엔드 실행

```bash

# 프로젝트 루트에서 front 폴더로 이동
cd front

# 라이브러리 설치
npm install

# 개발 서버 실행
npm start


```

### 3) 발급된 openai api key입력

```python

# project_root/back/.env
OPENAI_API_KEY=your_openai_api_key_here

```
