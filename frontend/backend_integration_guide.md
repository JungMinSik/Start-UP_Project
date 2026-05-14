# [백엔드 연동 가이드]

## 1. 인증 및 세션 관리

### 인증 부분
*   **현재 상태**: `localStorage`에 가입된 사용자 목록을 저장하여 임시로 체크함.
*   **연동 방법**:
    1.  `handleAuth` 함수 내 로직을 서버의 `/api/auth/login` 또는 `/api/auth/signup` 엔드포인트 호출로 변경.
    2.  서버로부터 받은 **JWT 토큰**을 쿠키나 `Authorization` 헤더에 저장.
    3.  `page.tsx`의 `useEffect`에서 토큰 유효성을 검사하여 `isLoggedIn` 상태를 결정.

### 세션 및 대화 내역
*   **현재 상태**: 리액트 `useState`로만 관리됨. **새로고침 시 모든 대화 내역이 초기화되는 휘발성 구조.**
*   **데이터베이스 구조**:
    *   `Sessions Table`: `id`, `user_id`, `title`, `mode`, `interviewer_id`, `created_at`
    *   `Messages Table`: `session_id`, `role` (user/assistant), `content`, `created_at`
*   **API 엔드포인트**:
    *   `GET /api/sessions`: 사용자의 모든 세션 목록 로드.
    *   `POST /api/sessions`: 새 대화방 생성.
    *   `GET /api/sessions/{id}/messages`: 특정 대화방의 이전 대화 기록 로드.
    *   `DELETE /api/sessions/{id}`: 세션 삭제 (휴지통 이동).

---

## 2. 메시지 전송 및 AI 응답

### `handleSendMessage` 함수 수정
사용자가 메시지를 보낼 때 현재는 `setTimeout`으로 가짜 응답을 만들지만, 이를 API 호출로 바꿔야 함.

```javascript
// page.tsx 내 수정 예시
const handleSendMessage = async (text, file, audioBlob) => {
  // 1. 사용자 메시지 DB 저장 API 호출
  // 2. AI 응답 생성 API 호출 (FastAPI 또는 Node.js 서버)
  const response = await fetch('/api/chat/generate', {
    method: 'POST',
    body: JSON.stringify({ 
      sessionId: currentSessionId,
      message: text,
      mode: currentSession.mode,
      resumeContext: currentSession.resumeAfter // 이력서 기반 모의 면접용 데이터 전달
    })
  });
  const data = await response.json();
  
  // 3. 받은 AI 응답을 상태값에 업데이트
  setSessions(...)
};
```

---

## 3. 음성 및 파일 처리

### 음성 인식 및 합성
1.  **STT (Speech-to-Text)**:
    *   `audioBlob`을 서버의 `/api/voice/stt`로 전송.
    *   서버에서 **OpenAI Whisper** 등을 이용해 텍스트로 변환 후 반환.
2.  **TTS (Text-to-Speech)**:
    *   AI 답변 텍스트를 `/api/voice/tts`로 전송.
    *   서버에서 **OpenAI TTS** 또는 **ElevenLabs**를 사용하여 오디오 파일 반환.
    *   프론트엔드에서 `new Audio(url).play()`로 재생.

### 이력서 분석 
*   **현재 상태**: 가상의 `resumeBefore`, `resumeAfter` 데이터를 사용함.
*   **연동 방법**:
    1.  파일 업로드 시 `/api/resume/analyze` 호출.
    2.  서버에서 PDF/TXT 파싱 후 LLM을 통해 첨삭 전/후 데이터 추출.
    3.  결과값(`before`, `after`, `highlights`)을 받아 `Session` 상태에 저장.

---

## 4. 면접 결과 리포트

### 리포트 데이터 생성
*   면접이 종료될 때(`onEndInterview`) `/api/interview/report` 호출.
*   백엔드에서는 해당 세션의 전체 대화 내역(`Messages Table`)을 분석하여 다음 데이터를 산출 (연산 부하 감소를 위해 점수/차트 로직 제거됨):
    *   `strengths`: 핵심 강점 리스트 (배열)
    *   `weaknesses`: 보완해야 할 약점 리스트 (배열)
    *   `feedback`: AI의 종합 조언 문구

---

## 하드코딩 포인트

| 파일 위치 | 기능 | 하드코딩 내용 | 수정 방향 |
| :--- | :--- | :--- | :--- |
| `page.tsx` | 로그인 | `localStorage` 체크 | 실제 Auth API 연동 |
| `page.tsx` | AI 답변 | `setTimeout` + 고정 문구 | LLM (OpenAI 등) API 연동 |
| `page.tsx` | 이력서 분석 | 고정된 첨삭 문장들 | 파일 분석 및 LLM 추출 결과 연동 |
| `ChatInterface.tsx` | 음성 처리 | `audioBlob` 전송만 준비됨 | Whisper(STT) API 연동 |
| `InterviewReport.tsx` | 피드백 출력 | 가상의 텍스트 피드백 | 세션 전체 분석 데이터 연동 |

---
