import { supabase } from '../../supabase/client';
import type { Vote } from './types';

export async function getVotes(): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function submitVote(userId: string, choice: boolean): Promise<void> {
  const { error: upsertError } = await supabase
    .from('votes')
    .upsert({
      user_id: userId,
      choice
    }, {
      onConflict: 'user_id'
    });

  if (upsertError) throw upsertError;
}