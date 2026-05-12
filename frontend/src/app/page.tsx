"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import InterviewerSection from '@/components/InterviewerSection';
import ResumeComparison from '@/components/ResumeComparison';
import InterviewReport, { ReportData } from '@/components/InterviewReport';
import {
    AlertTriangle,
    Briefcase,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    FileText,
    Info,
    Layout as LayoutIcon,
    Mic,
    Monitor,
    RotateCcw,
    Settings,
    Trophy
} from 'lucide-react';

// 메시지 및 세션 인터페이스 정의
// 세션 통합 관리 구조: 첨삭 완료된 이력서(resumeAfter) 기반으로 모의 면접 진행됨
// 첨삭 데이터와 면접 로그를 하나의 Session 객체 안에서 통합 저장함
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Session {
    id: string;
    title: string;
    mode: 'interview' | 'resume';
    status: 'active' | 'trashed';
    interviewMessages: Message[]; // 면접 모드에서 주고받은 대화 내용 [하드코딩]
    resumeMessages: Message[];    // 첨삭 모드에서 주고받은 대화 내용 [하드코딩]
    style: string;
    videoMode: boolean;
    interviewInterface: string;   // 면접 인터페이스 설정
    resumeInterface: string;      // 첨삭 인터페이스 설정 (항상 '텍스트'로 관리)
    createdAt: string;
    deletedAt?: string | null;
    interviewerId: 'normal_f' | 'normal_m' | 'pressure_f' | 'pressure_m';
    resumeBefore?: string;
    resumeAfter?: string;
    resumeHighlights?: { original: string; improved: string; reason: string }[];
    isCompleted?: boolean;
}

export default function Home() {
    // 메인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [user, setUser] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [page, setPage] = useState<'home' | 'session_view'>('home');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isAiTalking, setIsAiTalking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("답변 생성 중...");

    const [modalType, setModalType] = useState<'delete' | 'bulk_delete' | 'empty_trash' | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 이력서 비교 및 리포트 표시 여부 결정
    const [showComparison, setShowComparison] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const currentSession = sessions.find(s => s.id === currentSessionId);

    // 세션 및 모드 변경에 따른 비교 화면 표시 제어
    useEffect(() => {
        if (currentSession?.mode === 'resume') {
            const hasFile = currentSession.resumeMessages.some(m => m.content.includes("📄 [파일 첨부:"));
            if (hasFile) {
                setShowComparison(true); // 파일 존재 시 비교창 활성화
            } else {
                setShowComparison(false); // 파일 미존재 시 비활성화
            }
        } else {
            setShowComparison(false); // 면접 모드 시 비활성화
        }
    }, [currentSessionId, currentSession?.mode, currentSession?.resumeMessages]);

    // AI 답변 생성 중단 처리
    const handleStopGeneration = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsLoading(false);
        setIsAiTalking(false);

        // 생성 중단 안내 문구 추가 [하드코딩]
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const mode = s.mode;
                const stopMsg: Message = { role: 'assistant', content: "⚠️ 답변 생성이 사용자에 의해 중단되었습니다." };
                if (mode === 'interview') {
                    return { ...s, interviewMessages: [...s.interviewMessages, stopMsg] };
                } else {
                    return { ...s, resumeMessages: [...s.resumeMessages, stopMsg] };
                }
            }
            return s;
        }));
    };

    // 신규 세션 생성 및 초기 메시지 설정
    const createSession = (title: string, mode: 'interview' | 'resume') => {
        const newSession: Session = {
            id: Math.random().toString(36).substr(2, 9),
            title: title,
            mode: mode,
            status: 'active',
            interviewMessages: [
                { role: 'assistant', content: "안녕하세요. 면접을 시작하겠습니다. 자기소개 부탁드립니다." }
            ],
            resumeMessages: [
                { role: 'assistant', content: "안녕하세요. 이력서 첨삭을 도와드리겠습니다. 먼저 지원하시는 '희망 직무'와 이력서에서 강조하고 싶은 '핵심 키워드'를 말씀해 주세요." }
            ],
            style: '일반 면접',
            videoMode: true,
            interviewInterface: '텍스트',
            resumeInterface: '텍스트',
            createdAt: new Date().toISOString(),
            interviewerId: 'normal_f',
            isCompleted: false
        };
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        setPage('session_view');
    };

    const deleteSession = (id: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'trashed', deletedAt: new Date().toISOString() } : s));
        if (currentSessionId === id) {
            setCurrentSessionId(null);
            setPage('home');
        }
    };

    const restoreSession = (id: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'active', deletedAt: null } : s));
    };

    const hardDeleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const emptyTrash = () => {
        setSessions(prev => prev.filter(s => s.status !== 'trashed'));
    };

    const updateSessionTitle = (id: string, newTitle: string) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    };

    // 메시지 전송 및 AI 응답 처리 [하드코딩]
    // API 연동 시 주의: 면접 모드에서 메시지 전송 시 단순 채팅 로그뿐만 아니라
    // 완성된 이력서 데이터(currentSession.resumeAfter)도 페이로드에 같이 넘겨야 함
    // (AI가 이력서를 프롬프트로 삼아 꼬리 질문 생성하기 위함)
    const handleSendMessage = (text: string, file?: File | null, audioBlob?: Blob | null) => {
        if (!currentSessionId || !currentSession) return;

        const mode = currentSession.mode;
        let userContent = "";
        if (file) userContent += `📄 [파일 첨부: ${file.name}]\n\n`;
        if (audioBlob) userContent += `🎙️ [음성 메시지 입력됨]`;
        userContent += text;

        // 사용자 메시지를 화면에 즉시 업데이트
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                if (mode === 'interview') {
                    return { ...s, interviewMessages: [...s.interviewMessages, { role: 'user', content: userContent }] };
                } else {
                    return { ...s, resumeMessages: [...s.resumeMessages, { role: 'user', content: userContent }] };
                }
            }
            return s;
        }));

        // 로딩 상태 표시
        setLoadingMessage(audioBlob ? "음성 분석 중..." : (file ? "이력서 분석 및 답변 생성 중..." : "답변 생성 중..."));
        setIsLoading(true);

        timerRef.current = setTimeout(() => {
            setIsLoading(false);
            let response = "";

            if (mode === 'resume') {
                const hasJobInfo = currentSession.resumeMessages.some(m => m.role === 'user');

                if (file && !hasJobInfo) {
                    response = `첨부해주신 파일(${file.name})은 잘 받았습니다! 하지만 아직 어떤 직무에 지원하시는지 알지 못해 맞춤형 첨삭이 어렵습니다. \n\n지원하실 '희망 직무'와 '핵심 키워드'를 먼저 말씀해 주시면, 이 파일을 즉시 분석해 드릴게요! 😊`;
                } else if (file && hasJobInfo) {
                    // 가상 이력서 분석 데이터 생성 [하드코딩]
                    const before = "저는 성실하게 일하는 개발자입니다. 다양한 프로젝트를 수행하며 실력을 쌓았습니다.";
                    const after = "풍부한 프로젝트 경험을 통해 실무 역량을 검증받은 성실한 개발자입니다. 대규모 트래픽 처리 및 성능 최적화 경험을 보유하고 있습니다.";
                    const highlights = [
                        { original: "성실하게 일하는", improved: "실무 역량을 검증받은", reason: "단순한 형용사보다는 '역량 검증'이라는 구체적인 표현이 신뢰감을 줍니다." },
                        { original: "실력을 쌓았습니다", improved: "성능 최적화 경험을 보유하고 있습니다", reason: "전문성을 드러낼 수 있는 구체적인 기술 키워드를 사용하는 것이 좋습니다." }
                    ];

                    setSessions(prev => prev.map(s => {
                        if (s.id === currentSessionId) {
                            return {
                                ...s,
                                resumeBefore: before,
                                resumeAfter: after,
                                resumeHighlights: highlights
                            };
                        }
                        return s;
                    }));

                    setShowComparison(true);
                    response = `기다려 주셔서 감사합니다! 보내주신 이력서를 분석하여 우측 화면에 첨삭 결과를 띄워 드렸습니다. \n\n문장별 수정 이유를 확인해 보시고, 더 보완하고 싶은 부분이 있다면 말씀해 주세요.`;
                } else if (!file && !hasJobInfo) {
                    response = `확인되었습니다! 말씀해주신 '${text}' 내용을 바탕으로 첨삭을 준비하겠습니다. 이제 분석할 '이력서 파일(PDF/TXT)'을 첨부해 주세요.`;
                } else if (!file && hasJobInfo && !currentSession.resumeBefore) {
                    response = `이제 실제 분석을 위해 '이력서 파일(PDF/TXT)'을 여기에 끌어다 놓거나 업로드해 주세요! 😊`;
                } else {
                    response = `말씀하신 '${text}' 내용을 반영하여 수정을 계속하겠습니다. 추가로 궁금하신 점이나 수정이 필요한 부분이 있다면 말씀해 주세요.`;
                }
            } else {
                // 면접 모드용 시뮬레이션 질문 답변 [하드코딩]
                if (currentSession.style === '압박 면접') {
                    response = `'${text}'라고 하셨는데, 그 부분이 실제 실무에서 어떤 가치를 줄 수 있는지 증명할 수 있나요? 기술적으로 더 깊이 있는 설명이 필요합니다.`;
                } else {
                    response = "네, 답변 감사드립니다. 관련하여 본인의 강점을 가장 잘 드러낼 수 있는 구체적인 에피소드가 있다면 하나 더 소개해 주시겠어요?";
                }
            }

            // AI 답변 업데이트
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    if (mode === 'interview') {
                        return { ...s, interviewMessages: [...s.interviewMessages, { role: 'assistant', content: response }] };
                    } else {
                        return { ...s, resumeMessages: [...s.resumeMessages, { role: 'assistant', content: response }] };
                    }
                }
                return s;
            }));

            setIsAiTalking(true);
            if (audioRef.current) {
                audioRef.current.onended = () => setIsAiTalking(false);
            }
            setTimeout(() => setIsAiTalking(false), 3000);
            timerRef.current = null;
        }, 1500);
    };

    // 삭제 확인 모달 렌더링
    const renderModal = () => {
        if (!modalType) return null;
        let title = modalType === 'delete' ? "대화 삭제" : "휴지통 비우기";
        let content = modalType === 'delete' ? "정말 삭제하시겠습니까?" : "휴지통의 모든 대화를 영구적으로 삭제하시겠습니까?";
        let actionLabel = modalType === 'delete' ? "확인" : "영구 삭제";
        let onAction = modalType === 'delete'
            ? () => { if (pendingDeleteId) deleteSession(pendingDeleteId); setModalType(null); }
            : () => { emptyTrash(); setModalType(null); };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#3C3D37] w-full max-w-sm p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6">
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle size={24} />
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{content}</p>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onAction} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-colors">{actionLabel}</button>
                        <button onClick={() => setModalType(null)} className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-xl hover:bg-white/20 transition-colors">취소</button>
                    </div>
                </div>
            </div>
        );
    };

    // 미인증 사용자용 인증 화면 [하드코딩]
    if (!isLoggedIn) {
        const handleAuth = () => {
            setError("");
            if (!username.trim() || !password.trim()) {
                setError("아이디와 비밀번호를 모두 입력해주세요.");
                return;
            }
            const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (authMode === 'signup') {
                if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return; }
                if (storedUsers.some((u: any) => u.username === username)) { setError("이미 존재하는 아이디입니다."); return; }
                localStorage.setItem('users', JSON.stringify([...storedUsers, { username, password }]));
                alert("회원가입 완료! 이제 로그인해보세요.");
                setAuthMode('login');
            } else {
                const foundUser = storedUsers.find((u: any) => u.username === username && u.password === password);
                if (foundUser || (username === 'test' && password === '1234')) {
                    setUser(username);
                    setIsLoggedIn(true);
                } else {
                    setError("아이디랑 비밀번호를 다시 확인해주세요.");
                }
            }
        };

        return (
            <div className="flex items-center justify-center min-h-screen bg-[#252620] text-white animate-in fade-in duration-500">
                <div className="w-full max-w-md p-8 bg-[#3C3D37] rounded-[32px] border border-white/10 shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">AI 면접관 & 이력서 첨삭</h2>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-2xl flex">
                        <button onClick={() => setAuthMode('login')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${authMode === 'login' ? 'bg-[#697565] text-white shadow-lg' : 'text-white/30'}`}>로그인</button>
                        <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${authMode === 'signup' ? 'bg-[#697565] text-white shadow-lg' : 'text-white/30'}`}>회원가입</button>
                    </div>
                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1"><AlertTriangle size={14} /> {error}</div>}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/30 ml-2">아이디</label>
                            <input className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-[#697565] transition-all" placeholder="ID를 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white/30 ml-2">비밀번호</label>
                            <input className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-[#697565] transition-all" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {authMode === 'signup' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-bold text-white/30 ml-2">비밀번호 확인</label>
                                <input className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-[#697565] transition-all" type="password" placeholder="비밀번호를 한 번 더 입력하세요" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                        )}
                        <button onClick={handleAuth} className="w-full bg-[#697565] py-4 rounded-2xl font-bold hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#697565]/20 mt-6">{authMode === 'login' ? '로그인하기' : '가입하기'}</button>
                    </div>
                </div>
            </div>
        );
    }

    // 메인 대시보드 화면
    return (
        <div className="flex h-screen bg-[#252620] text-white overflow-hidden font-sans">
            {renderModal()}

            <Sidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onNavigate={(p: any, id: any) => { setPage(p); if (id) setCurrentSessionId(id); }}
                onDeleteSession={(id: string) => { setPendingDeleteId(id); setModalType('delete'); }}
                onRestoreSession={restoreSession}
                onHardDeleteSession={hardDeleteSession}
                onEmptyTrash={() => setModalType('empty_trash')}
                onRenameSession={updateSessionTitle}
                onLogout={() => setIsLoggedIn(false)}
                user={user}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* 현재 위치 네비게이션 */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-black/5 shrink-0">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <span>AI 면접관</span>
                        <ChevronRight size={12} />
                        <span className="text-white/80">{page === 'home' ? '홈' : currentSession?.title}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
                    {page === 'home' ? (
                        <div className="min-h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
                            <div className="text-center space-y-4">
                                <h1 className="text-6xl font-bold tracking-tight text-white/90">준비되셨나요, <span className="text-[#697565]">{user}님?</span></h1>
                                <p className="text-white/30 text-xl">원하시는 모드를 선택하여 시작해보세요.</p>
                            </div>
                            <div className="flex gap-12">
                                <button onClick={() => createSession("새로운 모의 면접", 'interview')} className="group relative w-80 h-96 bg-[#3C3D37] rounded-[48px] border border-white/5 hover:border-[#697565]/50 transition-all hover:shadow-2xl flex flex-col items-center justify-center space-y-8">
                                    <div className="w-24 h-24 rounded-3xl bg-[#697565]/10 flex items-center justify-center text-[#697565] group-hover:scale-110 transition-transform"><Monitor size={48} /></div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white/80">AI 모의 면접</h3>
                                        <p className="text-white/30 text-sm mt-2 font-medium uppercase tracking-widest">Start Interview</p>
                                    </div>
                                    <ChevronRight className="absolute bottom-12 text-white/10 group-hover:text-[#697565]" />
                                </button>
                                <button onClick={() => createSession("새로운 이력서 첨삭", 'resume')} className="group relative w-80 h-96 bg-[#3C3D37] rounded-[48px] border border-white/5 hover:border-[#697565]/50 transition-all hover:shadow-2xl flex flex-col items-center justify-center space-y-8">
                                    <div className="w-24 h-24 rounded-3xl bg-[#697565]/10 flex items-center justify-center text-[#697565] group-hover:scale-110 transition-transform"><FileText size={48} /></div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white/80">이력서 첨삭</h3>
                                        <p className="text-white/30 text-sm mt-2 font-medium uppercase tracking-widest">Resume Correction</p>
                                    </div>
                                    <ChevronRight className="absolute bottom-12 text-white/10 group-hover:text-[#697565]" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-8 w-full max-w-[1800px] mx-auto pb-10">
                            {/* 모드 전환 탭 (이력서 첨삭 / AI 면접) */}
                            <div className="flex gap-1 bg-black/20 p-2 rounded-2xl w-fit border border-white/5 shrink-0 z-10">
                                <button
                                    onClick={() => setSessions(prev => prev.map(s => {
                                        if (s.id === currentSessionId && s.mode !== 'resume') {
                                            const hasInteraction = s.resumeMessages.length > 1;
                                            const hasFile = s.resumeBefore || s.resumeMessages.some(m => m.content.includes("📄 [파일 첨부:"));

                                            let newMessages = [...s.resumeMessages];
                                            if (hasInteraction) {
                                                const content = hasFile
                                                    ? "이력서 첨삭 모드로 다시 전환되었습니다. 수정을 원하는 부분을 계속 말씀해 주세요."
                                                    : "이력서 첨삭 모드로 전환되었습니다. 분석을 위해 이력서 파일을 먼저 업로드해 주시면 감사하겠습니다! 😊";
                                                newMessages.push({ role: 'assistant', content });
                                            }

                                            return {
                                                ...s,
                                                mode: 'resume',
                                                resumeMessages: newMessages
                                            };
                                        }
                                        return s;
                                    }))}
                                    className={`px-12 py-4 rounded-xl text-base font-bold transition-all ${currentSession?.mode === 'resume' ? 'bg-[#697565] text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
                                >이력서 첨삭</button>
                                <button
                                    onClick={() => setSessions(prev => prev.map(s => {
                                        if (s.id === currentSessionId && s.mode !== 'interview') {
                                            const hasInteraction = s.interviewMessages.length > 1;
                                            let newMessages = [...s.interviewMessages];
                                            if (hasInteraction) {
                                                newMessages.push({ role: 'assistant', content: "AI 모의 면접 모드로 다시 전환되었습니다. 면접을 계속하시겠습니까?" });
                                            }

                                            return {
                                                ...s,
                                                mode: 'interview',
                                                interviewMessages: newMessages
                                            };
                                        }
                                        return s;
                                    }))}
                                    className={`px-12 py-4 rounded-xl text-base font-bold transition-all ${currentSession?.mode === 'interview' ? 'bg-[#697565] text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
                                >AI 모의 면접</button>
                            </div>
                            {/* 상세 설정 영역 (인터페이스, 스타일, 성별 등) */}
                            <div className="bg-[#3C3D37]/50 rounded-[32px] border border-white/5 shadow-2xl backdrop-blur-md shrink-0 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                                <div className="px-8 h-[90px] flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-10">
                                        {currentSession?.mode === 'interview' ? (
                                            <>
                                                {/* 기본 설정: 인터페이스, 스타일 */}
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap"><Monitor size={14} /> 인터페이스</span>
                                                    <div className="flex bg-black/20 p-1 rounded-xl">
                                                        {['텍스트', '음성'].map(opt => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => setSessions(prev => prev.map(s => {
                                                                    if (s.id === currentSessionId && s.interviewInterface !== opt) {
                                                                        const msg = opt === '음성' ? "음성 인터페이스로 전환되었습니다." : "텍스트 인터페이스로 전환되었습니다.";
                                                                        return { ...s, interviewInterface: opt, interviewMessages: [...s.interviewMessages, { role: 'assistant', content: msg }] };
                                                                    }
                                                                    return s;
                                                                }))}
                                                                className={`px-5 py-2 rounded-lg text-[11px] font-bold transition-all ${currentSession?.interviewInterface === opt ? 'bg-[#697565] text-white shadow-md' : 'text-white/40 hover:text-white'}`}
                                                            >{opt}</button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap"><LayoutIcon size={14} /> 스타일</span>
                                                    <div className="flex bg-black/20 p-1 rounded-xl">
                                                        {['일반', '압박'].map(opt => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => setSessions(prev => prev.map(s => {
                                                                    const fullOpt = opt === '일반' ? '일반 면접' : '압박 면접';
                                                                    if (s.id === currentSessionId && s.style !== fullOpt) {
                                                                        const isMale = s.interviewerId?.endsWith('_m') || false;
                                                                        const newAvatar = opt === '압박' ? (isMale ? 'pressure_m' : 'pressure_f') : (isMale ? 'normal_m' : 'normal_f');
                                                                        return { ...s, style: fullOpt, interviewerId: newAvatar, interviewMessages: [...s.interviewMessages, { role: 'assistant', content: `${fullOpt} 모드로 전환되었습니다.` }] };
                                                                    }
                                                                    return s;
                                                                }))}
                                                                className={`px-5 py-2 rounded-lg text-[11px] font-bold transition-all ${currentSession?.style.startsWith(opt) ? 'bg-[#697565] text-white shadow-md' : 'text-white/40 hover:text-white'}`}
                                                            >{opt}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] flex items-center gap-2"><Monitor size={16} className="text-[#697565]" /> 이력서 첨삭: 텍스트 대화 전용</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {currentSession?.mode === 'interview' && (
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">화상 모드</span>
                                                <button onClick={() => setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, videoMode: !s.videoMode } : s))} className={`px-8 py-2 rounded-xl text-[11px] font-bold transition-all ${currentSession?.videoMode ? 'bg-red-500/80 text-white' : 'bg-[#697565] text-white'}`}>{currentSession?.videoMode ? 'OFF' : 'ON'}</button>
                                            </div>
                                        )}
                                        {currentSession?.mode === 'resume' && (
                                            <button onClick={() => { if (window.confirm("초기화하시겠습니까?")) setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, resumeMessages: [s.resumeMessages[0]] } : s)); }} className="flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold bg-white/5 text-white/90 hover:bg-white/10 border border-white/5"><RotateCcw size={14} className="text-[#697565]" /> 초기화</button>
                                        )}
                                    </div>
                                </div>

                                {currentSession?.mode === 'interview' && (
                                    <details className="border-t border-white/5 group">
                                        <summary className="h-10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group-open:bg-black/20">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">
                                                <Settings size={12} /> 추가 설정 및 종료
                                                <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                                            </div>
                                        </summary>
                                        <div className="p-6 bg-black/20 flex items-center justify-center gap-12 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">면접관 성별</span>
                                                <div className="flex bg-black/20 p-1 rounded-xl">
                                                    {[{ label: '여성', id: 'f' }, { label: '남성', id: 'm' }].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => setSessions(prev => prev.map(s => {
                                                                if (s.id === currentSessionId) {
                                                                    const isPressure = s.style === '압박 면접';
                                                                    const newAvatar = isPressure ? (opt.id === 'm' ? 'pressure_m' : 'pressure_f') : (opt.id === 'm' ? 'normal_m' : 'normal_f');
                                                                    return { ...s, interviewerId: newAvatar };
                                                                }
                                                                return s;
                                                            }))}
                                                            className={`px-6 py-2 rounded-lg text-[11px] font-bold transition-all ${currentSession?.interviewerId?.endsWith(opt.id) ? 'bg-[#697565] text-white' : 'text-white/40 hover:text-white'}`}
                                                        >{opt.label}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-white/5"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (window.confirm("면접을 종료하고 피드백을 받으시겠습니까?")) {
                                                        setSessions(prev => prev.map(s => {
                                                            if (s.id === currentSessionId) {
                                                                return { ...s, isCompleted: true, interviewMessages: [...s.interviewMessages, { role: 'assistant', content: "⚠️ 면접이 정상적으로 종료되었습니다. 리포트를 확인해 주세요." }] };
                                                            }
                                                            return s;
                                                        }));
                                                        setShowReport(true);
                                                    }
                                                }}
                                                className="px-8 py-3 bg-gradient-to-r from-[#697565] to-[#3C3D37] text-white text-[12px] font-bold rounded-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                                            >
                                                <Trophy size={16} className="text-yellow-400" /> 면접 분석 및 종료
                                            </button>
                                        </div>
                                    </details>
                                )}
                            </div>


                            <div className="flex gap-10 h-[850px]">
                                {currentSession?.mode === 'interview' && currentSession?.videoMode && (
                                    <div className="w-[45%] flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 shrink-0">
                                        <div className="bg-[#3C3D37]/30 rounded-[56px] border border-white/5 p-12 flex flex-col shadow-2xl relative overflow-hidden h-[850px]">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#697565]/30 to-transparent"></div>
                                            <div className="mb-8 flex items-center justify-between shrink-0">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-white/90 tracking-tight">{currentSession?.mode === 'interview' ? 'AI 모의 면접' : '이력서 상담'}</h2>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                                        <span className="text-xs font-bold text-white/20 uppercase tracking-[0.3em]">Interviewer Online</span>
                                                    </div>
                                                </div>
                                                <div className="bg-[#697565]/20 px-6 py-2.5 rounded-2xl border border-[#697565]/30">
                                                    <span className="text-sm font-bold text-[#697565] uppercase tracking-widest">{currentSession?.style}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <InterviewerSection
                                                    isAiTalking={isAiTalking}
                                                    interviewerId={currentSession?.interviewerId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex flex-col min-w-0 h-[850px] animate-in fade-in duration-500 transition-all ${showComparison ? 'w-[45%]' : 'flex-1'}`}>
                                    {currentSession?.mode === 'resume' && (
                                        <details className="mb-6 group bg-[#3C3D37]/40 border border-white/5 rounded-[32px] overflow-hidden transition-all shrink-0">
                                            <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-bold text-white/90 text-sm tracking-tight">
                                                <div className="flex items-center gap-3">
                                                    <Info size={20} className="text-[#697565]" /> 이용 가이드 및 팁
                                                </div>
                                                <ChevronDown size={18} className="group-open:rotate-180 transition-transform opacity-50" />
                                            </summary>
                                            <div className="px-8 pb-6 text-sm text-white/80 space-y-2 border-t border-white/5 pt-5 leading-relaxed">
                                                <p>• 구체적인 에피소드를 말씀해 주실수록 AI가 더 정교한 질문을 던집니다.</p>
                                                <p>• 이력서 문구 수정을 원하시면 '이 문장을 더 임팩트 있게 고쳐줘'라고 입력해 보세요.</p>
                                                <p>• 면접 연습 시에는 실제 목소리로 대답하는 '음성 모드'를 적극 추천합니다!</p>
                                            </div>
                                        </details>
                                    )}

                                    <div className="flex-1 bg-[#3C3D37]/20 rounded-[56px] border border-white/5 overflow-hidden shadow-xl flex flex-col">
                                        <ChatInterface
                                            messages={currentSession?.mode === 'interview' ? (currentSession?.interviewMessages || []) : (currentSession?.resumeMessages || [])}
                                            onSendMessage={handleSendMessage}
                                            isLoading={isLoading}
                                            onStop={handleStopGeneration}
                                            loadingMessage={loadingMessage}
                                            interfaceMode={currentSession?.mode === 'interview' ? currentSession?.interviewInterface : '텍스트'}
                                            placeholder={currentSession?.mode === 'resume'
                                                ? "이력서 고민이나 수정하고 싶은 부분을 상세히 말씀해 주세요..."
                                                : "면접 답변을 입력해 주세요..."}
                                            onResetChat={() => {
                                                if (window.confirm("현재 대화 기록을 초기화하시겠습니까? 처음부터 다시 시작됩니다.")) {
                                                    setSessions(prev => prev.map(s => {
                                                        if (s.id === currentSessionId) {
                                                            const resetMsg = s.mode === 'interview'
                                                                ? "안녕하세요. 면접을 시작하겠습니다. 자기소개 부탁드립니다."
                                                                : "안녕하세요. 이력서 첨삭을 도와드리겠습니다. 먼저 지원하시는 '희망 직무'와 이력서에서 강조하고 싶은 '핵심 키워드'를 말씀해 주세요.";

                                                            return s.mode === 'interview'
                                                                ? { ...s, interviewMessages: [{ role: 'assistant', content: resetMsg }] }
                                                                : { ...s, resumeMessages: [{ role: 'assistant', content: resetMsg }] };
                                                        }
                                                        return s;
                                                    }));
                                                    setShowComparison(false); // 초기화 시 비교 화면도 닫기
                                                }
                                            }}
                                            isCompleted={currentSession?.isCompleted}
                                            onEndInterview={currentSession?.mode === 'interview' && !currentSession?.isCompleted ? () => {
                                                const messageCount = currentSession?.interviewMessages?.length || 0;
                                                if (messageCount <= 1) {
                                                    alert("면접 내용이 없습니다. 먼저 면접을 진행해 주세요.");
                                                    return;
                                                }

                                                if (window.confirm("면접을 즉시 종료하시겠습니까? (피드백 없이 종료됩니다)")) {
                                                    setSessions(prev => prev.map(s => {
                                                        if (s.id === currentSessionId) {
                                                            return { ...s, isCompleted: true, interviewMessages: [...s.interviewMessages, { role: 'assistant', content: "⚠️ 면접이 강제 종료되었습니다." }] };
                                                        }
                                                        return s;
                                                    }));
                                                }
                                            } : undefined}
                                        />
                                    </div>
                                </div>

                                {/* 이력서 비교 창 (첨삭 모드) */}
                                {showComparison && (
                                    <div className="flex-1 flex flex-col h-[850px] animate-in fade-in slide-in-from-right-4 duration-700">
                                        <ResumeComparison
                                            beforeText={currentSession?.resumeBefore || ""}
                                            afterText={currentSession?.resumeAfter || ""}
                                            highlights={currentSession?.resumeHighlights || []}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* 결과 리포트 모달 */}
            {showReport && (
                <InterviewReport
                    onClose={() => setShowReport(false)}
                />
            )}
        </div>
    );
}