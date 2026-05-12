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

  // 메시지 추가 시 자동 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 마이크 녹음 로직 (추후 서버 연동 필요) [하드코딩]
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // 녹음된 오디오를 백엔드(Whisper API)로 보내기 위해 전달
        onSendMessage("", null, audioBlob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("마이크 접근 실패:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

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
      className="flex flex-col h-full bg-black/10 rounded-3xl border border-white/5 overflow-hidden shadow-inner relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#697565]/20 backdrop-blur-md border-4 border-dashed border-[#697565] rounded-[24px] flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
          <div className="w-20 h-20 bg-[#697565] rounded-full flex items-center justify-center text-white mb-4 shadow-2xl">
            <Paperclip size={32} />
          </div>
          <p className="text-xl font-bold text-white tracking-tight">파일을 여기에 놓으세요</p>
          <p className="text-white/50 text-sm mt-2">PDF 또는 TXT 파일만 가능합니다.</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              m.role === 'user' ? 'bg-[#697565] text-white' : 'bg-[#3C3D37] border border-white/10 text-[#697565]'
            }`}>
              {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[75%] px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-[#697565] text-white rounded-tr-none' 
                : 'bg-[#3C3D37] text-white/90 border border-white/5 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-[#3C3D37] border border-white/10 flex items-center justify-center text-[#697565]">
              <Bot size={20} />
            </div>
            <div className="bg-[#3C3D37] px-5 py-4 rounded-[24px] rounded-tl-none text-xs text-white/40 italic">
              {loadingMessage || "AI가 생각 중입니다..."}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-[#3C3D37]/30 border-t border-white/5 space-y-4">
        {interfaceMode === '음성' && (
          <div className="relative group">
            {/* 녹음 중 비주얼라이저 애니메이션 */}
            {isRecording && (
              <div className="absolute -top-16 left-0 right-0 flex items-center justify-center gap-1 h-12 bg-[#3C3D37]/80 backdrop-blur-md rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2 duration-300">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-[#697565] rounded-full animate-voice-bar shadow-[0_0_10px_rgba(105,117,101,0.3)]"
                    style={{ 
                      height: '20%',
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                  ></div>
                ))}
                <span className="ml-4 text-[10px] font-bold text-white/60 uppercase tracking-widest animate-pulse">Recording...</span>
              </div>
            )}

            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isCompleted}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg animate-in slide-in-from-bottom-4 duration-500 mb-2 ${
                isCompleted ? 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed' :
                (isRecording 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-[#697565] text-white hover:scale-[1.01] active:scale-[0.99] shadow-[#697565]/20')
              }`}
            >
              {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
              {isRecording ? '녹음 중지' : '답변 녹음'}
            </button>
          </div>
        )}

        {selectedFile && (
          <div className="flex items-center gap-2 bg-[#697565]/20 border border-[#697565]/40 rounded-xl px-3 py-2 w-fit animate-in zoom-in-95 duration-200">
            <FileText size={16} className="text-[#697565]" />
            <span className="text-xs font-bold text-white/80">{selectedFile.name}</span>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X size={14} className="text-white/40" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          <div className="relative">
            {/* 면접 모드 전용 액션 메뉴 [하드코딩] */}
            {onEndInterview && showActionMenu && (
              <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-1 p-1.5 bg-[#3C3D37] border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-[70] min-w-[140px]">
                <button 
                  type="button"
                  onClick={() => { onEndInterview(); setShowActionMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-[#697565] rounded-xl transition-all whitespace-nowrap text-left group"
                >
                  <CheckCircle2 size={14} className="text-[#697565] group-hover:text-white" /> 면접 종료
                </button>
                <button 
                  type="button"
                  onClick={() => { onResetChat?.(); setShowActionMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all whitespace-nowrap text-left"
                >
                  <RotateCcw size={14} /> 대화 초기화
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
              className={`p-3 rounded-xl transition-all ${isCompleted ? 'opacity-50 cursor-not-allowed text-white/20' : (selectedFile || (onEndInterview && showActionMenu) ? 'bg-[#697565] text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10')}`}
            >
              {onEndInterview ? (
                <Plus size={22} className={`transition-transform duration-300 ${showActionMenu ? 'rotate-45' : ''}`} />
              ) : (
                <Paperclip size={22} />
              )}
            </button>
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isCompleted}
            placeholder={isCompleted ? "종료된 대화입니다." : (placeholder || "메시지를 입력하거나 파일을 첨부하세요...")}
            className={`flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none transition-all ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#697565] placeholder:text-white/20'}`}
          />
          
          <button 
            type="submit"
            disabled={isCompleted || (!input.trim() && !selectedFile) && !isLoading}
            className={`p-3 rounded-xl transition-all ${
              isCompleted ? 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed' :
              (isLoading ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 
              ((!input.trim() && !selectedFile) ? 'bg-white/5 text-white/20' : 'bg-[#697565] text-white hover:scale-105 shadow-lg shadow-[#697565]/20'))
            }`}
          >
            {isLoading ? <Square size={22} fill="currentColor" /> : <Send size={22} />}
          </button>
        </form>
      </div>
    </div>
  );
}
