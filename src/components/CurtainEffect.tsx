import React, { useEffect, useState } from 'react';

export default function CurtainEffect() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Left curtain */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-1/2 transition-transform duration-2000 ease-[cubic-bezier(0.4,0,0.2,1)] transform origin-left
          ${isOpen ? '-translate-x-full' : 'translate-x-0'}`}
        style={{
          background: 'linear-gradient(135deg, #8B0000 0%, #4A0000 100%)',
          boxShadow: 'inset -30px 0 70px rgba(0,0,0,0.9), 20px 0 40px rgba(0,0,0,0.7)',
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            rgba(139,0,0,0.95)0px,
            rgba(139,0,0,0.95)10px,
            rgba(100,0,0,0.9)10px,
            rgba(100,0,0,0.9)12px
          )`
        }}>
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to right,
              transparent 0px,
              transparent 40px,
              rgba(0,0,0,0.3)40px,
              rgba(0,0,0,0.3)41px
            )`
          }}
        />
      </div>
      
      {/* Right curtain */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 transition-transform duration-2000 ease-[cubic-bezier(0.4,0,0.2,1)] transform origin-right
          ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        style={{
          background: 'linear-gradient(-135deg, #8B0000 0%, #4A0000 100%)',
          boxShadow: 'inset 30px 0 70px rgba(0,0,0,0.9), -20px 0 40px rgba(0,0,0,0.7)',
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(139,0,0,0.95)0px,
            rgba(139,0,0,0.95)10px,
            rgba(100,0,0,0.9)10px,
            rgba(100,0,0,0.9)12px
          )`
        }}>
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to left,
              transparent 0px,
              transparent 40px,
              rgba(0,0,0,0.3)40px,
              rgba(0,0,0,0.3)41px
            )`
          }}
        />
      </div>
      
      {/* Curtain rod */}
      <div 
        className="absolute top-0 left-0 right-0 h-6"
        style={{
          background: 'linear-gradient(to bottom, #B88A3B, #8B6B20)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
        }}
      />
    </div>
  );
}