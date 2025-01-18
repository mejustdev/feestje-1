import React from 'react';
import { Cake, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BirthdayInfo() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-none relative overflow-hidden">
      {/* Sparkle animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 left-2 w-4 h-4 bg-yellow-400 rounded-full animate-spin-slow opacity-50" />
        <div className="absolute top-2 right-2 w-4 h-4 bg-pink-400 rounded-full animate-float opacity-50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-purple-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-50" />
      </div>

      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-600">
          <div className="flex items-center gap-2">
            <Cake className="animate-bounce" />
          Verjaardagsdetails
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Card className="bg-pink-50 border-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Calendar className="text-pink-500" />
              <h3 className="font-semibold text-purple-700">Datum</h3>
              <p className="text-gray-600">Zaterdag 13 april 2024</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Clock className="text-purple-500" />
              <h3 className="font-semibold text-purple-700">Tijd</h3>
              <p className="text-gray-600">14:00 - 17:00</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}