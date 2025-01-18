import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BirthdayCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-02-24T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-600">
          Tijd tot Verjaardag
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-purple-50 border-none">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{timeLeft.days}</div>
              <div className="text-sm text-purple-500">Dagen</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-none">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.hours}</div>
              <div className="text-sm text-pink-500">Uren</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-none">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{timeLeft.minutes}</div>
              <div className="text-sm text-purple-500">Minuten</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-none">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-pink-600">{timeLeft.seconds}</div>
              <div className="text-sm text-pink-500">Seconden</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}