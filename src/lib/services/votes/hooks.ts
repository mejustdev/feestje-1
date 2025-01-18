import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { getVotes, submitVote } from './api';
import { useAuth } from '../../auth/hooks';
import type { Vote, VoteStats } from './types';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadVotes() {
      try {
        const votes = await getVotes();
        setVotes(votes);
        setError(null);
      } catch (err) {
        console.error('Failed to load votes:', err);
        setError('Failed to load votes');
      } finally {
        setIsLoading(false);
      }
    }

    loadVotes();

    const channel = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        async () => {
          try {
            const votes = await getVotes();
            setVotes(votes);
            setError(null);
          } catch (err) {
            console.error('Failed to update votes:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats: VoteStats = {
    yes: votes.filter(v => v.choice).length,
    no: votes.filter(v => !v.choice).length,
    total: votes.length,
    userVote: user ? votes.find(v => v.user_id === user.id)?.choice ?? null : null
  };

  const handleVote = async (choice: boolean) => {
    if (!user) {
      window.dispatchEvent(new Event('show-auth-modal'));
      return;
    }

    try {
      setError(null);
      await submitVote(user.id, choice);
    } catch (err) {
      console.error('Failed to submit vote:', err);
      setError('Failed to submit vote');
    }
  };

  return {
    isLoading,
    error,
    stats,
    handleVote
  };
}