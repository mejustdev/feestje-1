import React from 'react';
import { MapPin } from 'lucide-react';
import PhotoFrame from './PhotoFrame';

export default function LocationMap() {
  return (
    <div className="p-6 bg-white/80 rounded-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
        <MapPin className="animate-pulse" />
        Waar je me kunt vinden
      </h2>
      <PhotoFrame />
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-100/50"></div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-gray-700">
            Kom met mij feesten in mijn magische huis!
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Let op: Vraag mijn ouders voor het exacte adres 🏠
          </p>
        </div>
      </div>
    </div>
  );
}