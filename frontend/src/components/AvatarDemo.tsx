"use client";

import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

/**
 * [데모] AI 면접관 애니메이션 업그레이드 버전
 * 이 파일은 독립적인 데모용으로 작성되었습니다.
 */
export default function AvatarDemo() {
  const [isTalking, setIsTalking] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#1E201E] p-10 rounded-[50px] border border-white/5 shadow-2xl">
      <style jsx>{`
        /* 1. 기본 호흡 효과 (둥둥 떠있는 느낌) */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* 2. 말할 때 이미지가 살짝 들썩이는 효과 */
        @keyframes talk-vibration {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.02, 0.98); }
          75% { transform: scale(0.98, 1.02); }
        }

        /* 3. 배경 빛이 퍼져나가는 효과 (Glow) */
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        /* 4. 음성 파형 바 애니메이션 */
        @keyframes wave-bar {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }

        .avatar-container {
          animation: float 4s ease-in-out infinite;
        }

        .avatar-talking {
          animation: talk-vibration 0.2s ease-in-out infinite;
        }

        .glow-effect {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .wave-bar {
          animation: wave-bar 0.6s ease-in-out infinite;
        }
      `}</style>

      <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.4em] mb-12">Avatar Interaction Demo</h2>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* 말할 때만 더 크게 퍼지는 배경 광원 */}
        {isTalking && (
          <div className="absolute inset-0 bg-[#697565]/20 blur-[80px] rounded-full glow-effect"></div>
        )}
        
        {/* 기본 배경 후광 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#697565]/10 to-transparent blur-[40px] rounded-full"></div>

        {/* 아바타 이미지 컨테이너 */}
        <div className={`relative w-full h-full z-10 avatar-container ${isTalking ? 'avatar-talking' : ''}`}>
          <img 
            src="/Interviewer_img.png" 
            alt="AI Interviewer" 
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            onError={(e) => {
              // 이미지 없을 경우 대비한 샘플 이미지
              e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop";
            }}
          />

          {/* 입 주변에 미세한 입자 효과 (말할 때만) */}
          {isTalking && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 blur-xl rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 하단 음성 파형 */}
        {isTalking && (
          <div className="absolute -bottom-10 left-0 right-0 flex items-end justify-center gap-1.5 h-10">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="wave-bar w-1.5 bg-[#697565] rounded-full shadow-[0_0_10px_rgba(105,117,101,0.5)]" 
                style={{ animationDelay: `${i * 0.05}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* 데모 컨트롤 버튼 */}
      <div className="mt-24 space-y-4 text-center">
        <button 
          onClick={() => setIsTalking(!isTalking)}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${
            isTalking 
              ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' 
              : 'bg-[#697565] text-white shadow-xl shadow-[#697565]/20 hover:scale-105'
          }`}
        >
          {isTalking ? <MicOff size={20} /> : <Mic size={20} />}
          {isTalking ? 'AI 답변 중단 테스트' : 'AI 답변 시작 테스트'}
        </button>
        <p className="text-white/20 text-[10px] tracking-widest font-medium uppercase">
          {isTalking ? 'The interviewer is speaking...' : 'Click the button to simulate AI voice'}
        </p>
      </div>
    </div>
  );
}
