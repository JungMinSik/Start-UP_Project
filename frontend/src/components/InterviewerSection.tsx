"use client";

import React from 'react';

interface InterviewerSectionProps {
  isAiTalking: boolean;
  interviewerId?: 'normal_f' | 'normal_m' | 'pressure_f' | 'pressure_m';
}

export default function InterviewerSection({ isAiTalking, interviewerId = 'normal_f' }: InterviewerSectionProps) {
  // 면접관 캐릭터 이미지 매핑
  const avatarImages = {
    normal_f: '/normal_f.png',
    normal_m: '/normal_m.png',
    pressure_f: '/pressure_f.png',
    pressure_m: '/pressure_m.png',
  };

  const avatarSrc = avatarImages[interviewerId] || avatarImages.normal_f;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-4 bg-black/10 rounded-[40px] border border-white/5 overflow-hidden">
      <style jsx>{`
        /* 캐릭터 부유 효과 */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* 캐릭터 진동 효과 (발화 시) */
        @keyframes talk-vibration {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.02, 0.98); }
          75% { transform: scale(0.98, 1.02); }
        }

        /* 배경 발광 효과 */
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        /* 음성 파형 애니메이션 */
        @keyframes wave-bar {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }

        .avatar-container {
          animation: float 4s ease-in-out infinite;
          transition: all 0.5s ease;
        }

        .avatar-talking {
          animation: talk-vibration 0.6s ease-in-out infinite;
        }

        .glow-effect {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .wave-bar {
          animation: wave-bar 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* 배경 후광 효과 */}
      <div className={`absolute inset-0 bg-[#B18B67]/10 blur-[100px] transition-all duration-1000 ${isAiTalking ? 'opacity-100 scale-110 glow-effect' : 'opacity-0 scale-100'}`}></div>

      <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2">
        <div className={`relative w-full h-full avatar-container ${isAiTalking ? 'avatar-talking' : ''}`}>
          <img 
            src={avatarSrc} 
            alt="AI Interviewer" 
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
          
          {/* 음성 파형 가시화 */}
          {isAiTalking && (
            <div className="absolute bottom-4 left-0 right-0 flex items-end justify-center gap-1.5 h-10 z-20">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="wave-bar w-1.5 bg-[#B18B67] rounded-full shadow-[0_0_15px_rgba(105,117,101,0.5)]" 
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 상태 표시바 */}
      <div className="mt-4 shrink-0 pb-4">
        <div className={`flex items-center gap-3 px-6 py-2 rounded-full bg-black/20 border border-white/5 transition-all ${isAiTalking ? 'border-[#B18B67]/50' : ''}`}>
           <div className={`w-2 h-2 rounded-full ${isAiTalking ? 'bg-[#B18B67] animate-pulse' : 'bg-white/20'}`}></div>
           <span className={`text-[10px] font-bold tracking-[0.4em] uppercase ${isAiTalking ? 'text-[#3D352F]' : 'text-[#3D352F]'}`}>
             {isAiTalking ? 'AI Interviewer Speaking' : 'Standing By'}
           </span>
        </div>
      </div>
    </div>
  );
}
