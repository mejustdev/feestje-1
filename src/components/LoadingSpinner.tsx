import React from 'react';
import { Heart } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
      <div className="text-center">
        <Heart className="w-16 h-16 text-pink-500 animate-bounce mx-auto" />
        <p className="mt-4 text-xl font-semibold text-purple-600 animate-pulse">
          Magie laden... ✨
        </p>
      </div>
    </div>
  );
}