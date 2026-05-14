"use client";

import React, { useState } from 'react';
import { 
  Home, Trash2, LogOut, Settings, MessageSquare, 
  MoreVertical, Edit3, ChevronDown, ChevronUp, AlertCircle, Briefcase,
  ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';

interface SidebarProps {
  sessions: any[];
  currentSessionId: string | null;
  onNavigate: (page: string, id?: string) => void;
  onDeleteSession: (id: string) => void;
  onRestoreSession: (id: string) => void;
  onHardDeleteSession: (id: string) => void;
  onEmptyTrash: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onLogout: () => void;
  user: string;
}

export default function Sidebar({ 
  sessions, 
  currentSessionId, 
  onNavigate, 
  onDeleteSession,
  onRestoreSession,
  onHardDeleteSession,
  onEmptyTrash,
  onRenameSession,
  onLogout,
  user
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTrashExpanded, setIsTrashExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeSessions = sessions.filter(s => {
    if (s.status !== 'active') return false;
    
    // 검색 필터
    if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const trashedSessions = sessions.filter(s => s.status === 'trashed');

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
    setOpenPopoverId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle);
    }
    setEditingId(null);
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} h-full bg-[#CEE5D0] flex flex-col border-r border-[#405D4A]/10 shadow-2xl z-50 transition-all duration-300 relative text-[#405D4A]`}>
      {/* 사이드바 접기/펴기 버튼 */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#405D4A] rounded-full flex items-center justify-center text-white border border-[#2D2D2D]/10 shadow-lg z-[60] hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-8`}>
           <div className="w-10 h-10 bg-[#405D4A] rounded-xl flex items-center justify-center shadow-lg shadow-[#2D2D2D]/20 shrink-0">
              <Briefcase size={22} className="text-white" />
           </div>
           {!isCollapsed && <h1 className="text-xl font-bold text-[#405D4A] tracking-tight animate-in fade-in duration-300">AI 면접관</h1>}
        </div>
        
        <button 
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${
            currentSessionId === null ? 'bg-[#405D4A] text-white shadow-md' : 'text-[#405D4A]/80 hover:bg-[#2D2D2D]/5 hover:text-[#405D4A]'
          }`}
          title="홈으로 이동"
        >
          <Home size={18} />
          {!isCollapsed && <span className="font-bold text-sm whitespace-nowrap animate-in fade-in duration-300">홈</span>}
        </button>

        {/* 대화방 검색 영역 */}
        {!isCollapsed && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="relative group">
              <Search size={14} className="absolute left-3.5 top-3 text-[#405D4A]/50 group-focus-within:text-[#405D4A] transition-colors" />
              <input 
                type="text"
                placeholder="대화방 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#2D2D2D]/5 border border-black/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#405D4A] placeholder:text-[#405D4A]/40 focus:outline-none focus:border-[#6D8196] transition-all"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-none">
        {/* 삭제된 대화 보관함 [하드코딩] */}
        <div className="space-y-1">
          <button 
            onClick={() => !isCollapsed && setIsTrashExpanded(!isTrashExpanded)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-2 text-xs font-bold text-[#405D4A]/60 uppercase tracking-widest hover:text-[#405D4A] transition-colors`}
            title="휴지통"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={14} /> 
              {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in">휴지통 ({trashedSessions.length})</span>}
            </div>
            {!isCollapsed && (isTrashExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </button>
          
          {!isCollapsed && isTrashExpanded && (
            <div className="bg-[#2D2D2D]/5 rounded-xl p-2 mt-1 space-y-2 border border-black/5 animate-in slide-in-from-top-2">
              {trashedSessions.length > 0 && (
                <button 
                  onClick={onEmptyTrash}
                  className="w-full text-[10px] text-white font-bold py-2 bg-[#8E2424] hover:bg-[#8E2424]/80 rounded-md transition-all shadow-lg active:scale-95"
                >
                  휴지통 비우기
                </button>
              )}
              {trashedSessions.map(s => (
                <div key={s.id} className="bg-white/50 rounded-lg p-3 space-y-2 border border-black/5 shadow-sm">
                  <div className="text-xs text-[#405D4A] font-bold truncate px-1"> {s.title}</div>
                  <div className="flex gap-2">
                    <button onClick={() => onRestoreSession(s.id)} className="flex-1 text-[10px] bg-[#405D4A] text-white py-1.5 rounded-md hover:bg-[#405D4A]/80 transition-colors font-bold border border-black/10">복구</button>
                    <button onClick={() => onHardDeleteSession(s.id)} className="flex-1 text-[10px] bg-red-500/10 text-red-700 py-1.5 rounded-md hover:bg-red-500/20 transition-colors font-bold border border-red-500/20">영구삭제</button>
                  </div>
                </div>
              ))}
              {trashedSessions.length === 0 && <div className="text-[10px] text-[#405D4A]/60 text-center py-4 font-medium">비어 있음</div>}
            </div>
          )}
        </div>

        {/* 구분선 추가 */}
        {!isCollapsed && <div className="mx-4 h-px bg-[#2D2D2D]/10" />}

        {/* 활성화된 대화 목록 [하드코딩] */}
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="px-4 text-xs font-bold text-[#405D4A]/40 uppercase tracking-widest animate-in fade-in">
              진행 중인 대화
            </div>
          )}
          
          <div className="space-y-1">
            {activeSessions.map((session) => (
              <div key={session.id} className="relative group">
                {editingId === session.id ? (
                  !isCollapsed && (
                    <input
                      autoFocus
                      className="w-full bg-white/20 border border-[#6D8196]/30 rounded-xl px-4 py-2.5 text-sm text-[#405D4A] focus:outline-none"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(session.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(session.id)}
                    />
                  )
                ) : (
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1 px-2'} rounded-xl transition-all ${
                    currentSessionId === session.id ? 'bg-[#405D4A] shadow-lg shadow-[#6D8196]/20' : 'hover:bg-[#2D2D2D]/5'
                  }`}>
                    <button
                      onClick={() => onNavigate('session_view', session.id)}
                      className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'flex-1 gap-3 px-2 py-3'} text-sm text-left ${
                        currentSessionId === session.id ? 'text-white font-bold' : 'text-[#405D4A]/80 hover:text-[#405D4A]'
                      }`}
                      title={session.title}
                    >
                      <MessageSquare size={16} className={`${currentSessionId === session.id ? 'text-white' : 'text-[#405D4A]/60'} shrink-0`} />
                      {!isCollapsed && <span className="truncate whitespace-nowrap animate-in fade-in">{session.title}</span>}
                    </button>
                    
                    {!isCollapsed && (
                      <div className="relative">
                        <button 
                          onClick={() => setOpenPopoverId(openPopoverId === session.id ? null : session.id)}
                          className="p-1.5 text-[#48523A]/90 hover:text-[#48523A] hover:bg-[#48523A]/10 rounded-lg"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {openPopoverId === session.id && (
                          <div className="absolute right-0 top-8 w-32 bg-[#405D4A]">
                             <button 
                               onClick={() => handleStartEdit(session.id, session.title)}
                               className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#405D4A] hover:bg-[#2D2D2D]/5"
                             >
                               <Edit3 size={12} /> 수정
                             </button>
                             <button 
                               onClick={() => onDeleteSession(session.id)}
                               className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8E2424] hover:bg-red-500/10"
                             >
                               <Trash2 size={12} /> 삭제
                             </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {activeSessions.length === 0 && !isCollapsed && (
              <div className="text-xs text-white/90 text-center py-12 animate-in fade-in duration-500">
                {searchTerm ? '검색 결과가 없습니다' : '표시할 대화가 없습니다'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`mt-auto ${isCollapsed ? 'p-2' : 'p-4'} border-t border-black/5 space-y-4 bg-[#2D2D2D]/5`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between px-2'}`}>
           <div className={`text-sm font-bold text-[#405D4A] ${isCollapsed ? 'text-[10px]' : ''}`}>{isCollapsed ? user[0] : user}님</div>
           <button 
             onClick={onLogout}
             className={`${isCollapsed ? 'p-2' : 'text-[10px] px-2 py-1'} text-[#405D4A]/60 hover:text-[#405D4A] transition-colors font-bold uppercase tracking-widest`}
             title="로그아웃"
           >
             {isCollapsed ? <LogOut size={16} /> : '로그아웃'}
           </button>
        </div>
      </div>
    </div>
  );
}
