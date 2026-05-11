"use client";

import React from 'react';
import { 
  Trophy, Target, AlertCircle, CheckCircle2, 
  BarChart3, Zap, Brain, TrendingUp, X 
} from 'lucide-react';

export interface ReportData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  categoryScores: {
    communication: number;
    technical: number;
    attitude: number;
    problemSolving: number;
  };
}

interface InterviewReportProps {
  data?: ReportData;
  onClose: () => void;
}

export default function InterviewReport({ data, onClose }: InterviewReportProps) {
  // 기본 가상 데이터 정의 [하드코딩]
  const reportData = data || {
    score: 85,
    strengths: ["구체적인 기술 스택 활용 능력", "논리적인 답변 구조", "자신감 있는 태도"],
    weaknesses: ["답변의 간결성 부족", "실무 사례 연결성 보완 필요"],
    feedback: "전반적으로 우수한 면접 성과를 보여주셨습니다. 특히 본인의 기술적 강점을 논리적으로 설명하는 부분이 인상적이었습니다. 다만, 답변이 다소 길어지는 경향이 있어 핵심 위주로 요약하는 연습이 병행된다면 완벽할 것 같습니다.",
    categoryScores: {
      communication: 90,
      technical: 82,
      attitude: 95,
      problemSolving: 78
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-[#1C1C1C] w-full max-w-5xl h-[85vh] rounded-[48px] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* 상단 헤더 영역 */}
        <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#697565] rounded-2xl flex items-center justify-center shadow-lg shadow-[#697565]/20">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">면접 분석 리포트</h2>
              <p className="text-white/40 text-sm mt-1">AI Interviewer의 정밀 분석 결과입니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* 메인 리포트 컨텐츠 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-none">
          
          {/* 요약 섹션 (점수 및 카테고리별 차트) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 flex flex-col items-center justify-center bg-white/5 rounded-[40px] p-10 border border-white/5">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* 원형 점수 차트 배경 */}
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle 
                    cx="96" cy="96" r="88" fill="transparent" stroke="#697565" strokeWidth="12" 
                    strokeDasharray={552} strokeDashoffset={552 - (552 * reportData.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{reportData.score}</span>
                  <span className="text-sm font-bold text-white/30 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-6 py-2 bg-[#697565]/20 rounded-full border border-[#697565]/30">
                <Trophy size={16} className="text-[#697565]" />
                <span className="text-sm font-bold text-[#697565]">상위 15% 수준</span>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                <Target size={20} className="text-[#697565]" /> 역량별 상세 평가
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: '커뮤니케이션', score: reportData.categoryScores.communication, icon: Zap, color: 'bg-blue-400' },
                  { label: '직무 전문성', score: reportData.categoryScores.technical, icon: Brain, color: 'bg-purple-400' },
                  { label: '면접 태도', score: reportData.categoryScores.attitude, icon: CheckCircle2, color: 'bg-green-400' },
                  { label: '문제 해결 능력', score: reportData.categoryScores.problemSolving, icon: TrendingUp, color: 'bg-orange-400' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-white/40" />
                        <span className="text-sm font-bold text-white/80">{item.label}</span>
                      </div>
                      <span className="text-lg font-black text-white">{item.score}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000 delay-300`} 
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 강점 및 보완점 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#697565]/5 rounded-[40px] p-8 border border-[#697565]/10 space-y-6">
              <h3 className="text-lg font-bold text-[#697565] flex items-center gap-2">
                <CheckCircle2 size={20} /> 주요 강점
              </h3>
              <div className="space-y-3">
                {reportData.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#697565] mt-2 shrink-0"></div>
                    <span className="text-sm text-white/80 leading-relaxed">{s}</span>
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
                    <span className="text-sm text-white/80 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 종합 피드백 섹션 */}
          <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#697565]" /> AI 종합 피드백
            </h3>
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#697565] rounded-full"></div>
              <p className="text-lg text-white/70 leading-loose pl-4 italic font-medium">
                "{reportData.feedback}"
              </p>
            </div>
          </div>
        </div>

        {/* 하단 푸터 및 닫기 버튼 */}
        <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="px-16 py-4 bg-[#697565] text-white font-bold rounded-2xl shadow-xl shadow-[#697565]/20 hover:scale-105 transition-all active:scale-95"
          >
            대화로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
