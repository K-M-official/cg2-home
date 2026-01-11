import React from 'react';

/**
 * 星空流星雨背景组件
 * 可在整个应用中复用
 */
export const StarryBackground: React.FC = () => {
  // 生成随机流星
  const meteors = Array.from({ length: 15 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]"></div>

      {/* 星尘纹理 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

      {/* 流星 */}
      {meteors.map((m, i) => (
        <span
          key={i}
          className="absolute top-0 h-0.5 w-0.5 rounded-full bg-white shadow-[0_0_0_1px_#ffffff10] animate-meteor"
          style={{
            left: `${m.left}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
            top: '-10px',
          }}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-transparent to-white" />
        </span>
      ))}
    </div>
  );
};
