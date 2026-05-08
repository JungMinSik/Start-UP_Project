import streamlit as st
import uuid
import time
from datetime import datetime, timedelta
# import openai  # OpenAI API 사용 시 주석 해제

# 기본 페이지 세팅
st.set_page_config(page_title="AI 면접관 & 이력서 첨삭", layout="wide", page_icon="")

# UI 스타일링 및 테마 설정
st.markdown('''
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200..900&display=swap');

:root {
    --bg-color: #252620;
    --sidebar-bg: #3C3D37;
    --accent-color: #697565;
    --text-color: #FFFFFF;
    --font-stack: 'Noto Serif KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

footer { display: none !important; }
h1, h2, h3, h4, h5, h6, p, li, label, .stMarkdown p, .stMarkdown div, .stButton button {
    font-family: var(--font-stack) !important;
}

.stApp, header, .stHeader, [data-testid="stHeader"], [data-testid="stAppViewContainer"] {
    background-color: var(--bg-color) !important;
}

[data-testid="stIcon"], .stIcon, .material-icons, svg, i, span:has(svg), [class^="st-ae"], [class^="st-af"] {
    font-family: inherit !important;
    font-feature-settings: normal !important;
}

[data-baseweb="tab-highlight"] { background-color: var(--accent-color) !important; }
[data-testid="stRadioButton"] div[role="radiogroup"] div[aria-checked="true"] > div {
    background-color: var(--accent-color) !important;
}

div[data-baseweb="input"] > div { border-color: rgba(255, 255, 255, 0.2) !important; }
div[data-baseweb="input"] > div:focus-within {
    border-color: var(--accent-color) !important;
    box-shadow: 0 0 0 1px var(--accent-color) !important;
}

.stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp h5, .stApp h6, .stApp p, .stApp li, .stMarkdown, .stMarkdown div {
    color: var(--text-color) !important;
    -webkit-font-smoothing: antialiased;
}

[data-testid="stSidebar"] { background-color: var(--sidebar-bg) !important; }
[data-testid="stSidebar"] p, [data-testid="stSidebar"] span, [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
    color: var(--text-color) !important;
}

.stButton > button, div[data-testid="stFormSubmitButton"] > button {
    background-color: var(--accent-color) !important;
    color: #FFFFFF !important;
    font-weight: 700 !important;
    border-radius: 10px !important;
    border: none !important;
    width: 100% !important;
}
[data-testid="stSidebar"] div[data-testid="stPopover"] > div > button {
    background-color: var(--accent-color) !important;
    color: #FFFFFF !important;
    border-radius: 10px !important;
    height: 38px !important;
    justify-content: center !important;
}

/* 팝업 창 배경 제거 및 최적화 */
[data-testid="stPopoverBody"] {
    width: fit-content !important;
    padding: 0px !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

/* 사이드바 소제목 스타일 */
.sidebar-subheader {
    font-size: 1.1rem !important;
    font-weight: 700 !important;
    color: var(--text-color) !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* 사이드바 버튼 폰트 축소 (칸 크기는 유지) */
[data-testid="stSidebar"] .stButton button {
    height: 38px !important;
    min-height: 38px !important;
    padding: 0px 10px !important;
}
[data-testid="stSidebar"] .stButton button p {
    font-size: 0.85rem !important;
    white-space: nowrap !important;
}

/* 알림 및 안내창 테마 적용 (st.info, st.success 등) */
div[data-testid="stNotification"], 
div[role="alert"], 
.stAlert, 
[data-testid="stNotificationContent"] {
    background-color: var(--sidebar-bg) !important;
    color: var(--text-color) !important;
    border-radius: 15px !important;
    border: 1px solid var(--accent-color) !important;
}

/* 내부 배경색 제거 */
div[role="alert"] > div, 
div[data-testid="stNotification"] > div {
    background-color: transparent !important;
}

/* 아이콘 색상 변경 */
div[role="alert"] svg, 
div[data-testid="stNotification"] svg {
    fill: var(--accent-color) !important;
}

/* 앱 전체 레이아웃 최적화 */
[data-testid="stAppViewContainer"] {
    overflow: auto !important;
}

/* 면접관 숨쉬기 효과 */
@keyframes breathing {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.02); filter: brightness(1.1); }
    100% { transform: scale(1); filter: brightness(1); }
}
.interviewer-box {
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid var(--accent-color);
    box-shadow: 0 0 15px rgba(105, 117, 101, 0.3);
    animation: breathing 4s infinite ease-in-out;
}

/* 음성 파형 애니메이션 (보이스 비주얼라이저) */
.waveform {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 30px;
    gap: 3px;
    margin-top: 10px;
}
.bar {
    width: 4px;
    height: 10px;
    background: var(--accent-color);
    border-radius: 2px;
    animation: wave 1s infinite ease-in-out;
}
@keyframes wave {
    0%, 100% { height: 10px; }
    50% { height: 30px; }
}
.bar:nth-child(2) { animation-delay: 0.1s; }
.bar:nth-child(3) { animation-delay: 0.2s; }
.bar:nth-child(4) { animation-delay: 0.3s; }
.bar:nth-child(5) { animation-delay: 0.4s; }
/* 하단 고정 마이크 버튼 스타일 (Sticky 방식) */
.sticky-mic-container {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0px;
    z-index: 100;
    background-color: var(--bg-color);
    padding: 10px 0;
    border-top: 1px solid rgba(255,255,255,0.1);
}
</style>
''', unsafe_allow_html=True)

# 세션 상태 관리 (State Init)
if "users" not in st.session_state: st.session_state["users"] = {"test": "1234"}
if "current_user" not in st.session_state: st.session_state["current_user"] = None
if "is_logged_in" not in st.session_state: st.session_state["is_logged_in"] = False
if "page" not in st.session_state: st.session_state["page"] = "home"
if "sessions" not in st.session_state: st.session_state["sessions"] = {}
if "current_session_id" not in st.session_state: st.session_state["current_session_id"] = None
if "interview_count" not in st.session_state: st.session_state["interview_count"] = 0
if "resume_count" not in st.session_state: st.session_state["resume_count"] = 0
if "selection_mode" not in st.session_state: st.session_state["selection_mode"] = False
if "selected_sessions" not in st.session_state: st.session_state["selected_sessions"] = []
if "is_ai_talking" not in st.session_state: st.session_state["is_ai_talking"] = False

# 세션 관리 관련 유틸 함수들
def create_session(title="새로운 대화", initial_type="resume"):
    session_id = str(uuid.uuid4())
    st.session_state["sessions"][session_id] = {
        "id": session_id,
        "title": title,
        "active_mode": initial_type,
        "status": "active",
        "deleted_at": None,
        "resume_data": None,
        "resume_messages": [],
        "interview_messages": [],
        "interview_style": "일반 면접",
        "video_mode": False,
        "created_at": datetime.now().isoformat()
    }
    return session_id

def delete_session(session_id):
    st.session_state["sessions"][session_id]["status"] = "trashed"
    st.session_state["sessions"][session_id]["deleted_at"] = datetime.now().isoformat()
    if st.session_state["current_session_id"] == session_id:
        st.session_state["current_session_id"] = None; st.session_state["page"] = "home"
    active_exists = any(s["status"] == "active" for s in st.session_state["sessions"].values())
    if not active_exists and not [s for s in st.session_state["sessions"].values() if s["status"] == "trashed"]:
        st.session_state["interview_count"] = 0; st.session_state["resume_count"] = 0

def restore_session(session_id):
    st.session_state["sessions"][session_id]["status"] = "active"
    st.session_state["sessions"][session_id]["deleted_at"] = None

def hard_delete_session(session_id):
    if session_id in st.session_state["sessions"]: del st.session_state["sessions"][session_id]
    if not st.session_state["sessions"]:
        st.session_state["interview_count"] = 0; st.session_state["resume_count"] = 0

def empty_trash():
    trashed_ids = [sid for sid, s in st.session_state["sessions"].items() if s["status"] == "trashed"]
    for sid in trashed_ids:
        if sid in st.session_state["sessions"]: del st.session_state["sessions"][sid]
    if not st.session_state["sessions"]:
        st.session_state["interview_count"] = 0; st.session_state["resume_count"] = 0

def go_to_page(page_name, session_id=None):
    st.session_state["page"] = page_name
    if session_id: st.session_state["current_session_id"] = session_id
    elif page_name == "home": st.session_state["current_session_id"] = None

# 타이핑 효과 함수 (시뮬레이션용)
def stream_data(text):
    for word in text.split(" "):
        yield word + " "
        time.sleep(0.08)

# TTS 음성 출력 함수
def speak_text(text, enabled=False):
    if not enabled: return
    st.toast(f"🔊 음성 재생 중: {text[:20]}...")

# STT (Whisper) 음성 인식 함수
def stt_whisper(audio_file):
    return "가짜 음성 인식 결과입니다. (Whisper API 연동 시 실제 답변으로 대체됩니다.)"
    
def save_title(session_id):
    new_title = st.session_state[f"title_input_{session_id}"]
    if new_title.strip(): st.session_state["sessions"][session_id]["title"] = new_title
    st.session_state[f"editing_{session_id}"] = False

# 삭제 컨펌 모달
@st.dialog("⚠️ 대화 삭제")
def delete_confirmation_dialog(session_id):
    st.write("정말 삭제하시겠습니까?")
    c1, c2 = st.columns(2)
    if c1.button("확인", type="primary"): delete_session(session_id); st.rerun()
    if c2.button("취소"): st.rerun()

@st.dialog("⚠️ 선택 항목 삭제")
def bulk_delete_confirmation_dialog():
    count = len(st.session_state["selected_sessions"])
    st.write(f"선택한 {count}개의 대화를 정말 삭제하시겠습니까?")
    c1, c2 = st.columns(2)
    if c1.button("확인", type="primary"):
        for sid in st.session_state["selected_sessions"]:
            delete_session(sid)
        st.session_state["selection_mode"] = False
        st.session_state["selected_sessions"] = []
        st.rerun()
    if c2.button("취소"): st.rerun()

@st.dialog("⚠️ 휴지통 비우기")
def empty_trash_confirmation_dialog():
    st.write("휴지통의 모든 대화를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    c1, c2 = st.columns(2)
    if c1.button("영구 삭제", type="primary"):
        empty_trash()
        st.rerun()
    if c2.button("취소"): st.rerun()

# 사이드바 레이아웃
with st.sidebar:
    st.title("AI 면접관")
    if not st.session_state["is_logged_in"]:
        st.warning("로그인이 필요합니다.")
    else:
        st.subheader("메뉴")
        if st.button("🏠 홈", use_container_width=True): go_to_page("home"); st.rerun()
        st.markdown("---")
        
        with st.expander("🗑️ 휴지통 (2일 보관)"):
            trashed = [s for s in st.session_state["sessions"].values() if s["status"] == "trashed"]
            if trashed:
                if st.button("🚨 휴지통 비우기", use_container_width=True):
                    empty_trash_confirmation_dialog()
                st.markdown("---")
            
            for ts in trashed:
                st.write(f"📄 {ts['title']}")
                c1, c2 = st.columns(2)
                if c1.button("복구", key=f"res_{ts['id']}"): restore_session(ts['id']); st.rerun()
                if c2.button("영구삭제", key=f"hdel_{ts['id']}"): hard_delete_session(ts['id']); st.rerun()

        # 대화 리스트 뿌려주기
        h1, h2 = st.columns([0.75, 0.25])
        h1.markdown("<p class='sidebar-subheader'>진행 중인 대화</p>", unsafe_allow_html=True)
        if h2.button("선택" if not st.session_state["selection_mode"] else "취소", key="toggle_selection"):
            st.session_state["selection_mode"] = not st.session_state["selection_mode"]
            st.session_state["selected_sessions"] = []
            st.rerun()
        
        if st.session_state["selection_mode"]:
            if st.button("🗑️ 선택 삭제", type="primary", use_container_width=True):
                if st.session_state["selected_sessions"]:
                    bulk_delete_confirmation_dialog()
                else:
                    st.warning("삭제할 대화를 선택해주세요.")

        active = [s for s in st.session_state["sessions"].values() if s["status"] == "active"]
        active.sort(key=lambda x: x["created_at"], reverse=True)
        
        for s in active:
            mode = s.get("active_mode", "resume")
            icon = "" if mode == "interview" else "📝"
            label = f"{icon} {s['title']}"
            if s["id"] == st.session_state.get("current_session_id"): label = f"📌 {s['title']} (현재)"
            
            if st.session_state["selection_mode"]:
                c1, c2 = st.columns([0.15, 0.85])
                is_selected = c1.checkbox("", key=f"check_{s['id']}", value=(s['id'] in st.session_state["selected_sessions"]))
                if is_selected:
                    if s['id'] not in st.session_state["selected_sessions"]:
                        st.session_state["selected_sessions"].append(s['id'])
                else:
                    if s['id'] in st.session_state["selected_sessions"]:
                        st.session_state["selected_sessions"].remove(s['id'])
                c2.write(label)
            else:
                if st.session_state.get(f"editing_{s['id']}", False):
                    st.text_input("수정", value=s["title"], key=f"title_input_{s['id']}", on_change=save_title, args=(s["id"],), label_visibility="collapsed")
                else:
                    c1, c2 = st.columns([0.85, 0.15])
                    if c1.button(label, key=f"open_{s['id']}", use_container_width=True):
                        go_to_page("session_view", s["id"]); st.rerun()
                    with c2.popover("\u200B"):
                        if st.button("✏️ 수정", key=f"ed_{s['id']}"): st.session_state[f"editing_{s['id']}"] = True; st.rerun()
                        if st.button("🗑️ 삭제", key=f"dl_{s['id']}"): delete_confirmation_dialog(s["id"])

        st.markdown("---")
        
        st.write(f"{st.session_state['current_user']}님")
        if st.button("로그아웃"): st.session_state["is_logged_in"] = False; st.session_state["current_user"] = None; st.rerun()

        st.markdown("---")
        st.subheader("⚙️ API 설정")
        st.text_input("OpenAI API Key", type="password", key="api_key_input", help="TTS/STT 기능을 사용하려면 키가 필요합니다.")

# 메인 뷰 로직
if not st.session_state["is_logged_in"]:
    st.title("AI 면접관 & 이력서 첨삭")
    st.markdown("서비스를 이용하시려면 로그인해주세요.")
    col_login, _ = st.columns([1, 1])
    with col_login:
        t1, t2 = st.tabs(["로그인", "회원가입"])
        with t1:
            with st.form("l_form"):
                l_id = st.text_input("아이디")
                l_pw = st.text_input("비밀번호", type="password")
                if st.form_submit_button("로그인", use_container_width=True, type="primary"):
                    if l_id in st.session_state["users"] and st.session_state["users"][l_id] == l_pw:
                        st.session_state["is_logged_in"] = True; st.session_state["current_user"] = l_id; st.rerun()
                    else: st.error("아이디나 비밀번호가 틀렸습니다.")
        with t2:
            with st.form("r_form"):
                r_id = st.text_input("새 아이디")
                r_pw = st.text_input("새 비밀번호", type="password")
                if st.form_submit_button("회원가입", use_container_width=True):
                    st.session_state["users"][r_id] = r_pw; st.success("가입 완료! 로그인을 해주세요."); st.rerun()

else:
    page = st.session_state["page"]
    
    def process_command(p):
        if "면접보기" in p.replace(" ", ""):
            st.session_state["interview_count"] += 1
            new_id = create_session(f"AI 모의 면접 {st.session_state['interview_count']}", "interview")
            go_to_page("session_view", new_id); return True
        return False

    if page == "home":
        st.title(f"환영합니다, {st.session_state['current_user']}님!")
        st.divider()
        
        c1, c2 = st.columns(2)
        with c1:
            st.info("#### AI 모의 면접\n실전 같은 면접 경험을 제공합니다.")
            if st.button("새 AI 모의 면접 시작", type="primary"):
                st.session_state["interview_count"] += 1
                go_to_page("session_view", create_session(f"AI 모의 면접 {st.session_state['interview_count']}", "interview")); st.rerun()
        with c2:
            st.success("#### 이력서 첨삭\nAI와 대화하며 이력서를 완성해보세요.")
            if st.button("새 첨삭 시작"):
                st.session_state["resume_count"] += 1
                go_to_page("session_view", create_session(f"이력서 첨삭 {st.session_state['resume_count']}", "resume")); st.rerun()

    elif page == "session_view":
        curr = st.session_state["sessions"].get(st.session_state["current_session_id"])
        if not curr: st.warning("세션을 찾을 수 없습니다."); go_to_page("home"); st.rerun()
        
        m1, m2, _ = st.columns([0.2, 0.2, 0.6])
        current_mode = curr.get("active_mode", "resume")
        if m1.button("이력서 첨삭", use_container_width=True, type="secondary" if current_mode == "interview" else "primary"):
            curr["active_mode"] = "resume"; st.rerun()
        if m2.button("AI 모의 면접", use_container_width=True, type="secondary" if current_mode == "resume" else "primary"):
            curr["active_mode"] = "interview"; st.rerun()
        
        st.markdown("---")

        if curr.get("active_mode", "resume") == "resume":
            st.title("이력서 첨삭")
            with st.expander("💡 이력서 첨삭 이용 가이드"):
                st.write("""
                1. 고민되는 경험이나 문구를 채팅창에 편하게 말씀해 주세요.
                2. AI의 질문에 답변한 후 '이력서 수정해줘'라고 입력하면 최종 수정안을 제시해 드립니다.
                3. 첨삭이 완료되면 상단 'AI 모의 면접' 버튼 클릭 혹은 '면접 시작'을 입력하여 즉시 면접을 볼 수 있습니다!
                """)
            st.divider()

            if not curr.get("resume_messages"):
                curr["resume_messages"] = [{"role": "assistant", "content": "안녕하세요! 어떤 경험을 이력서에 녹여내고 싶으신가요? 고민되는 부분을 말씀해 주시면 함께 수정안을 만들어 볼게요."}]
            
            for m in curr.get("resume_messages", []):
                with st.chat_message(m["role"]): st.markdown(m["content"])
            
            if p := st.chat_input("고민 상담 또는 '이력서 수정해줘'라고 입력하세요", accept_file=True, file_type=['pdf', 'txt', 'docx']):
                if p.text and ("면접시작" in p.text.replace(" ", "") or "면접보자" in p.text.replace(" ", "")):
                    curr["active_mode"] = "interview"; st.rerun()
                
                if not process_command(p.text if p.text else ""):
                    user_content = ""
                    if p.files: user_content += f"📄 [파일 첨부: {p.files[0].name}]\n\n"
                    if p.text: user_content += p.text

                    curr.setdefault("resume_messages", []).append({"role": "user", "content": user_content})
                    with st.chat_message("user"): st.markdown(user_content)
                    with st.chat_message("assistant"):
                        with st.spinner("AI 컨설턴트가 생각 중..."):
                            time.sleep(1.0)
                            if p.text and "수정" in p.text:
                                res = "말씀하신 내용을 반영하여 이력서 문구를 수정해 보았습니다.\n\n[수정안]\n'단순 기술 도입에 그치지 않고, MSA 환경에서 캐싱 전략을 최적화하여 응답 속도를 40% 개선하며 팀의 생산성을 높였습니다.'\n\n이 문구는 어떠신가요? 면접을 바로 보시려면 상단 'AI 모의 면접' 버튼을 클릭하거나 '면접 시작'이라고 말씀해 주세요!"
                                curr["resume_data"] = "MSA 환경에서 캐싱 전략을 최적화하여 응답 속도를 40% 개선"
                            elif p.text and ("역할" in p.text or "경험" in p.text):
                                res = "그 경험에서 본인이 맡았던 구체적인 역할은 무엇이었나요? 더 임팩트 있는 문구로 다듬어 드릴게요!"
                            else:
                                res = f"{p.text if p.text else '이력서'}에 대해 더 자세히 알고 싶습니다. 그 경험이 지원하시는 직무와 어떤 연관이 있다고 생각하시나요?"
                            st.markdown(res); curr.setdefault("resume_messages", []).append({"role": "assistant", "content": res})
                st.rerun()

        elif curr.get("active_mode", "resume") == "interview":
            # AI 모의 면접 모드 (분할 레이아웃: 좌측 면접관/버튼, 우측 채팅)
            st.title("AI 모의 면접")
            
            # 상단 설정 (스타일 등)
            col_s1, col_s2 = st.columns(2)
            with col_s1: ui = st.radio("인터페이스", ["텍스트", "음성"], horizontal=True)
            with col_s2:
                selected_style = st.radio("스타일", ["일반 면접", "압박 면접"], 
                                 index=0 if curr.get("interview_style") == "일반 면접" else 1, horizontal=True)
                if selected_style != curr.get("interview_style"):
                    curr["interview_style"] = selected_style
                    curr.setdefault("interview_messages", []).append({"role": "assistant", "content": f"📢 스타일: **{selected_style}**"})
                    st.rerun()
            
            st.divider()

            # 메인 분할 레이아웃
            v_left, v_right = st.columns([0.4, 0.6])
            
            with v_left:
                # 면접관 표시 (화상 모드일 때만)
                if curr.get("video_mode", True): # 기본적으로 보이게 설정하거나 토글 유지
                    st.markdown('<div class="interviewer-box">', unsafe_allow_html=True)
                    img_path = r"C:\Users\ekdus\.gemini\antigravity\brain\e3969c1b-c55b-4d64-96fa-1494af90e874\female_interviewer_v2_1778229880895.png"
                    st.image(img_path, use_container_width=True)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                    if st.session_state.get("is_ai_talking"):
                        st.markdown('''<div class="waveform"><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>''', unsafe_allow_html=True)
                
                st.write("")
                # 화상 모드 토글
                video_on = st.toggle("📹 화상 면접 모드", value=curr.get("video_mode", True))
                if video_on != curr.get("video_mode"):
                    curr["video_mode"] = video_on
                    st.rerun()
            
            with v_right:
                # 첫 메시지 생성
                if not curr.get("interview_messages"):
                    initial_msg = "안녕하세요! 면접을 시작하겠습니다. 자기소개 부탁드립니다."
                    curr["interview_messages"] = [{"role": "assistant", "content": initial_msg}]

                # 채팅 내역 및 신규 입력 처리 (스크롤 가능한 고정 영역)
                with st.container(height=550):
                    # 1. 기존 대화 기록 출력
                    for m in curr.get("interview_messages", []):
                        with st.chat_message(m["role"]): st.markdown(m["content"])
                    
                    # 2. 신규 입력 처리 및 실시간 답변 출력 (컨테이너 내부에서 렌더링)
                    input_text = None
                    if st.session_state.get("voice_input_trigger"):
                        trig = st.session_state.pop("voice_input_trigger")
                        input_text = trig if isinstance(trig, str) else getattr(trig, 'text', None)

                    if input_text:
                        curr.setdefault("interview_messages", []).append({"role": "user", "content": input_text})
                        with st.chat_message("user"): st.markdown(input_text)
                        
                        with st.chat_message("assistant"):
                            with st.spinner("AI 답변 중..."):
                                time.sleep(1.2)
                                res_text = "네, 답변 감사드립니다. 다음 질문입니다." # [MOCK]
                                st.session_state["is_ai_talking"] = True
                                st.write_stream(stream_data(res_text))
                                st.session_state["is_ai_talking"] = False
                                curr.setdefault("interview_messages", []).append({"role": "assistant", "content": res_text})
                        st.rerun()

                # 음성 모드일 때 마이크 버튼 (채팅창 바로 아래 배치)
                if ui == "음성":
                    st.write("")
                    if st.button("🎤 답변 녹음 시작", use_container_width=True, key="bottom_mic_btn", type="primary"):
                        voice_text = stt_whisper(None)
                        st.session_state["voice_input_trigger"] = voice_text
                        st.rerun()

                # 채팅 입력창 (텍스트 모드일 때만 표시)
                if ui == "텍스트":
                    p_in = st.chat_input("면접 답변을 입력하세요", accept_file=True, file_type=['pdf', 'txt', 'docx'])
                    if p_in:
                        st.session_state["voice_input_trigger"] = p_in
                        st.rerun()
                else:
                    # 음성 모드일 때는 입력창 대신 여백을 주어 버튼이 눈에 띄게 함
                    st.write("<br>", unsafe_allow_html=True)
