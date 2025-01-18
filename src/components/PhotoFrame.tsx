import React from 'react';

export default function PhotoFrame() {
  return (
    <div className="relative p-4 mt-6 w-[70%] mx-auto">
      {/* Rainbow frame border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 p-1.5 animate-pulse">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-xl" />
      </div>
      
      {/* Photo placeholder */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <img
          src="https://img.freepik.com/free-vector/cute-girl-birthday-party_1308-134839.jpg"
          alt="Birthday celebration illustration"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 mix-blend-overlay"
        />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg animate-bounce" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full shadow-lg animate-float" />
      <div className="absolute -bottom-2 right-6 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg animate-pulse" />
      <div className="absolute top-1/2 -right-3 w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg animate-pulse" />
      <div className="absolute top-1/2 -left-3 w-2 h-2 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full shadow-lg animate-float" />
    </div>
  );
}