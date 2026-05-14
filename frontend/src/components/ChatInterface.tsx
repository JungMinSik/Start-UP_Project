"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Paperclip, X, FileText, Mic, Plus, RotateCcw, CheckCircle2, Square } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, file?: File | null, audioBlob?: Blob | null) => void;
  isLoading?: boolean;
  placeholder?: string;
  loadingMessage?: string;
  interfaceMode?: string;
  onResetChat?: () => void;
  onEndInterview?: () => void;
  onStop?: () => void;
  isCompleted?: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading, placeholder, loadingMessage, interfaceMode, onResetChat, onEndInterview, onStop, isCompleted }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null); //ㅁㅊ
  const prevIsLoadingRef = useRef(isLoading);//ㅁㅊ

  // 메시지 추가 시 자동 스크롤 하단 고정
  useEffect(() => {
    // isLoading이 true에서 false로 바뀌는 순간 = "AI가 답변을 방금 다 작성했다!"
    if (prevIsLoadingRef.current && !isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // 마지막 메시지가 AI의 것이고, 현재 화면이 '음성' 모드일 때만 스피커 작동
      if (lastMessage.role === 'assistant' && interfaceMode === '음성') {
        const utterance = new SpeechSynthesisUtterance(lastMessage.content);
        utterance.lang = 'ko-KR'; // 한국어 설정
        utterance.rate = 1.0;     // 말하기 속도 (1.0이 기본)
        utterance.pitch = 1.0;    // 목소리 높낮이

        // 브라우저에 내장된 예쁜 한국어 목소리 찾기 (선택 사항)
        const voices = window.speechSynthesis.getVoices();
        const koreanVoice = voices.find(voice => voice.lang === 'ko-KR' && voice.name.includes('Google'));
        if (koreanVoice) utterance.voice = koreanVoice;

        window.speechSynthesis.cancel(); // 혹시 예전에 말하던 게 남아있으면 끊고
        window.speechSynthesis.speak(utterance); // 새로운 답변 읽기 시작!
      }
    }
    
    // 현재 로딩 상태를 기억해두기 (다음 턴을 위해)
    prevIsLoadingRef.current = isLoading;
  }, [isLoading, messages, interfaceMode]);

  // 🎤 Web Speech API를 활용한 진짜 STT 로직 (민식 추가)
    const startRecording = () => {
      // 브라우저 지원 여부 확인 (크롬, 엣지 등 지원)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다. 크롬 브라우저를 사용해주세요!");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR'; // 한국어 인식
      recognition.interimResults = false; // 말이 끝나면 한 번에 결과 반환
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("인식된 텍스트:", transcript);
        
        // 🔥 변환된 텍스트를 부모 컴포넌트(서버)로 전송!
        onSendMessage(transcript, null, null);
      };

      recognition.onerror = (event: any) => {
        console.error("음성 인식 에러:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      // 녹음 시작!
      recognition.start();
    };

    const stopRecording = () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    };

  //기존 다연 코드
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      onStop?.();
      return;
    }
    if (input.trim() || selectedFile) {
      onSendMessage(input, selectedFile, null);
      setInput("");
      setSelectedFile(null);
    }
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      const allowedExtensions = ['pdf', 'txt'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        alert("죄송합니다! 파일은 PDF 또는 TXT 형식만 지원합니다. 😅");
        return;
      }
      
      onSendMessage("", file, null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#FCF8E8] rounded-3xl border border-black/10 overflow-hidden shadow-inner relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#405D4A]/20 backdrop-blur-md border-4 border-dashed border-[#4A4A4A] rounded-[24px] flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
          <div className="w-20 h-20 bg-[#405D4A] rounded-full flex items-center justify-center text-white mb-4 shadow-2xl">
            <Paperclip size={32} />
          </div>
          <p className="text-xl font-bold text-[#405D4A] tracking-tight">파일을 여기에 놓으세요</p>
          <p className="text-[#405D4A]/70 text-sm mt-2">PDF 또는 TXT 파일만 가능합니다.</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-[#4A4A4A]/10">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'user' ? 'bg-[#405D4A] text-white' : 'bg-[#CEE5D0] border border-[#405D4A]/10 text-[#405D4A]'
            }`}>
              {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[80%] px-5 py-4 rounded-[24px] text-sm font-bold leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-[#405D4A] text-white rounded-tr-none' 
                : 'bg-[#CEE5D0] text-[#405D4A] border border-[#405D4A]/5 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-[#CEE5D0] border border-black/10 flex items-center justify-center text-[#405D4A]">
              <Bot size={20} />
            </div>
            <div className="bg-[#CEE5D0] px-5 py-4 rounded-[24px] rounded-tl-none text-xs text-[#405D4A]/90 italic">
              {loadingMessage || "AI가 생각 중입니다..."}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-[#4A4A4A]/10 space-y-4">
        {interfaceMode === '음성' && (
          <div className="relative group">
            {isRecording && (
              <div className="absolute -top-16 left-0 right-0 flex items-center justify-center gap-1 h-12 bg-[#CEE5D0]/80 backdrop-blur-md rounded-2xl border border-[#4A4A4A]/10 animate-in slide-in-from-bottom-2 duration-300">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-[#405D4A] rounded-full animate-voice-bar shadow-[0_0_10px_rgba(74,74,74,0.3)]"
                    style={{ 
                      height: '20%',
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                  ></div>
                ))}
                <span className="ml-4 text-[10px] font-bold text-[#405D4A]/90 uppercase tracking-widest animate-pulse">Recording...</span>
              </div>
            )}

            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isCompleted}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg animate-in slide-in-from-bottom-4 duration-500 mb-2 ${
                isCompleted ? 'bg-[#405D4A]/5 text-[#405D4A]/20 opacity-50 cursor-not-allowed' :
                (isRecording 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-[#405D4A] text-white hover:scale-[1.01] active:scale-[0.99] shadow-[#6D8196]/20')
              }`}
            >
              {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
              {isRecording ? '녹음 중지' : '답변 녹음'}
            </button>
          </div>
        )}

        {selectedFile && (
          <div className="flex items-center gap-2 bg-[#405D4A]/10 border border-[#4A4A4A]/20 rounded-xl px-3 py-2 w-fit animate-in zoom-in-95 duration-200">
            <FileText size={16} className="text-[#405D4A]" />
            <span className="text-xs font-bold text-[#405D4A]">{selectedFile.name}</span>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-[#405D4A]/20 rounded-full transition-colors"
            >
              <X size={14} className="text-[#405D4A]/40" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          <div className="relative">
            {onEndInterview && showActionMenu && (
              <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-1 p-1.5 bg-white border border-[#4A4A4A]/10 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-200 z-[70] min-w-[140px]">
                <button 
                  type="button"
                  onClick={() => { onEndInterview(); setShowActionMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#405D4A]/90 hover:bg-[#405D4A]/5 rounded-xl transition-all whitespace-nowrap text-left group"
                >
                  <CheckCircle2 size={14} className="text-[#405D4A]/60 group-hover:text-[#405D4A]" /> 면접 종료
                </button>
                <button 
                  type="button"
                  onClick={() => { onResetChat?.(); setShowActionMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#405D4A] hover:bg-[#405D4A]/5 rounded-xl transition-all whitespace-nowrap text-left group"
                >
                  <RotateCcw size={14} className="text-[#405D4A]" /> 대화 초기화
                </button>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.txt"
            />
            <button 
              type="button" 
              disabled={isCompleted}
              onClick={() => onEndInterview ? setShowActionMenu(!showActionMenu) : fileInputRef.current?.click()}
              className={`p-3 rounded-xl transition-all border-2 ${isCompleted ? 'opacity-50 cursor-not-allowed border-[#4A4A4A]/20 text-[#405D4A]/20' : (selectedFile || (onEndInterview && showActionMenu) ? 'bg-[#405D4A] border-[#4A4A4A] text-white shadow-lg' : 'bg-white border-[#4A4A4A]/20 text-[#405D4A]/60 hover:text-[#405D4A] hover:bg-[#405D4A]/5')}`}
            >
              {onEndInterview ? (
                <Plus size={22} strokeWidth={3} className={`transition-transform duration-300 ${showActionMenu ? 'rotate-45' : ''}`} />
              ) : (
                <Paperclip size={22} strokeWidth={3} />
              )}
            </button>
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isCompleted}
            placeholder={isCompleted ? "종료된 대화입니다." : (placeholder || "메시지를 입력하거나 파일을 첨부하세요...")}
            className={`flex-1 bg-[#2D2D2D]/15 border border-black/10 rounded-2xl px-5 py-4 text-sm text-[#405D4A] focus:outline-none transition-all ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#6D8196] placeholder:text-[#405D4A]/80'}`}
          />
          
          <button 
            type="submit"
            disabled={isCompleted || (!input.trim() && !selectedFile) && !isLoading}
            className={`p-3 rounded-xl transition-all border-2 ${
              isCompleted ? 'bg-white/5 border-black/20 text-[#405D4A]/20 opacity-50 cursor-not-allowed' :
              (isLoading ? 'bg-red-500/20 border-red-500/80 text-red-500 hover:bg-red-500/30' : 
              ((!input.trim() && !selectedFile) ? 'bg-white/5 border-black/20 text-[#405D4A]/20' : 'bg-[#405D4A] border-black/20 text-white hover:scale-105 shadow-lg shadow-[#6D8196]/20'))
            }`}
          >
            {isLoading ? <Square size={22} fill="currentColor" strokeWidth={3.5} /> : <Send size={22} strokeWidth={3.5} />}
          </button>
        </form>
      </div>
    </div>
  );
}
