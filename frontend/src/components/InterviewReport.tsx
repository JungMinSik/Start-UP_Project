"use client";

import React from 'react';
import { 
  AlertCircle, CheckCircle2, 
  BarChart3, X 
} from 'lucide-react';

export interface ReportData {
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}

interface InterviewReportProps {
  data?: ReportData;
  onClose: () => void;
}

export default function InterviewReport({ data, onClose }: InterviewReportProps) {
  // 기본 가상 데이터 정의 [하드코딩]
  const reportData = data || {
    strengths: ["구체적인 기술 스택 활용 능력", "논리적인 답변 구조", "자신감 있는 태도"],
    weaknesses: ["답변의 간결성 부족", "실무 사례 연결성 보완 필요"],
    feedback: "전반적으로 우수한 면접 성과를 보여주셨습니다. 특히 본인의 기술적 강점을 논리적으로 설명하는 부분이 인상적이었습니다. 다만, 답변이 다소 길어지는 경향이 있어 핵심 위주로 요약하는 연습이 병행된다면 완벽할 것 같습니다."
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-[#1C1C1C] w-full max-w-5xl h-[85vh] rounded-[48px] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* 상단 헤더 영역 */}
        <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#B18B67] rounded-2xl flex items-center justify-center shadow-lg shadow-[#B18B67]/20">
              <BarChart3 className="text-[#3D352F]" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3D352F] tracking-tight">면접 분석 리포트</h2>
              <p className="text-[#3D352F]/80 text-sm mt-1">AI Interviewer의 정밀 분석 결과입니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#3D352F]/80 hover:bg-white/10 hover:text-[#3D352F] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* 메인 리포트 컨텐츠 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-none">

          {/* 강점 및 보완점 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-400/5 rounded-[40px] p-8 border border-emerald-400/10 space-y-6">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={20} /> 주요 강점
              </h3>
              <div className="space-y-3">
                {reportData.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                    <span className="text-sm text-[#3D352F]/80 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-400/5 rounded-[40px] p-8 border border-red-400/10 space-y-6">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertCircle size={20} /> 보완이 필요한 점
              </h3>
              <div className="space-y-3">
                {reportData.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></div>
                    <span className="text-sm text-[#3D352F]/80 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 종합 피드백 섹션 */}
          <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-[#3D352F]/90 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#B18B67]" /> AI 종합 피드백
            </h3>
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#B18B67] rounded-full"></div>
              <p className="text-lg text-[#3D352F]/70 leading-loose pl-4 italic font-medium">
                "{reportData.feedback}"
              </p>
            </div>
          </div>
        </div>

        {/* 하단 푸터 및 닫기 버튼 */}
        <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="px-16 py-4 bg-[#B18B67] text-[#3D352F] font-bold rounded-2xl shadow-xl shadow-[#B18B67]/20 hover:scale-105 transition-all active:scale-95"
          >
            대화로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
