export type Vote = {
  id: string;
  user_id: string;
  choice: boolean;
  created_at: string;
  updated_at: string;
};

export type VoteStats = {
  yes: number;
  no: number;
  total: number;
  userVote: boolean | null;
};