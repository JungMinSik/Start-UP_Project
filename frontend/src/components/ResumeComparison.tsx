"use client";

import React from 'react';
import { FileText, ArrowRight, Info } from 'lucide-react';

interface ResumeComparisonProps {
  beforeText: string;
  afterText: string;
  highlights?: { original: string; improved: string; reason: string }[];
}

export default function ResumeComparison({ beforeText, afterText, highlights = [] }: ResumeComparisonProps) {
  return (
    <div className="flex flex-col h-full bg-[#3C3D37]/30 rounded-[56px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-700">
      {/* 상단 헤더 */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#697565]/20 flex items-center justify-center text-[#697565]">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white/90">이력서 실시간 첨삭 비교</h3>
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest mt-1">Before & After Comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#697565]/10 border border-[#697565]/20">
          <span className="text-[10px] font-black text-[#697565] uppercase tracking-tighter">AI Analysis Active</span>
        </div>
      </div>

      {/* 비교 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 원문 (Before) */}
        <div className="flex-1 flex flex-col border-r border-white/5">
          <div className="px-6 py-3 bg-black/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Original Text</span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 leading-relaxed text-white/60 text-sm whitespace-pre-wrap">
            {beforeText || "분석할 이력서 내용을 왼쪽 채팅창에 입력하거나 파일을 업로드해 주세요."}
          </div>
        </div>

        {/* 첨삭본 (After) */}
        <div className="flex-1 flex flex-col bg-[#697565]/5">
          <div className="px-6 py-3 bg-[#697565]/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#697565]"></span>
            <span className="text-[10px] font-bold text-[#697565] uppercase tracking-widest">Improved by AI</span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 leading-relaxed text-white/90 text-sm whitespace-pre-wrap">
            {afterText ? (
              <div className="space-y-4">
                {/* 실제 구현 시에는 Diff 라이브러리나 정규식을 써서 하이라이트 처리 */}
                {afterText}
                
                {/* 예시 하이라이트 툴팁 (나중에 로직 연결) */}
                {highlights.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-[#697565] uppercase tracking-[0.2em] mb-4">주요 수정 사항</h4>
                    {highlights.map((h, i) => (
                      <div key={i} className="group relative bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-[#697565]/30 transition-all cursor-help">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-red-400/50 line-through truncate max-w-[100px]">{h.original}</span>
                          <ArrowRight size={12} className="text-white/20" />
                          <span className="text-[10px] font-bold text-[#697565]">{h.improved}</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed flex items-start gap-2">
                          <Info size={12} className="mt-0.5 shrink-0 text-[#697565]" />
                          {h.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <FileText size={48} />
                <p className="text-xs font-medium">첨삭이 완료되면 이곳에 개선된 내용이 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
