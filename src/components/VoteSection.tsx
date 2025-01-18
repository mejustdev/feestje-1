import React from 'react';
import { PartyPopper, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVotes } from '@/lib/services/votes/hooks';
import { useAuth } from '@/lib/auth/hooks';

const MESSAGES = {
  yes: [
    "Joepie! Kan niet wachten om te vieren! 🎉",
    "Geweldig! Tot op het feestje! 🎈",
    "Hoera! We maken er iets magisch van! ✨"
  ],
  no: [
    "We zullen je missen! 💝",
    "Misschien volgende keer! 🌟",
    "We zullen je aanwezigheid missen! 🎀"
  ]
};

export default function VoteSection() {
  const { isLoading, error, stats, handleVote } = useVotes();
  const { user } = useAuth();

  const getMessage = () => {
    if (!user) return "Log in om ons te laten weten of je erbij bent! 🎊";
    if (stats.userVote === null) return "Doe je mee met het feest? 🎈";
    return MESSAGES[stats.userVote ? 'yes' : 'no'][
      Math.floor(Math.random() * MESSAGES[stats.userVote ? 'yes' : 'no'].length)
    ];
  };

  const yesPercentage = stats.total > 0 ? (stats.yes / stats.total) * 100 : 0;
  const noPercentage = stats.total > 0 ? (stats.no / stats.total) * 100 : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-600 flex items-center gap-2">
          <PartyPopper className="animate-bounce" />
          RSVP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-center font-medium text-gray-700">
          {getMessage()}
        </p>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant={stats.userVote === true ? 'default' : 'outline'}
            onClick={() => handleVote(true)}
            disabled={isLoading}
            className={`gap-2 ${
              stats.userVote === true 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'hover:bg-purple-50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Ja!
          </Button>

          <Button
            variant={stats.userVote === false ? 'default' : 'outline'}
            onClick={() => handleVote(false)}
            disabled={isLoading}
            className={`gap-2 ${
              stats.userVote === false
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'hover:bg-purple-50'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Nee
          </Button>
        </div>

        {stats.total > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Komt: {stats.yes}</span>
              <span>Komt niet: {stats.no}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${yesPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}