export type Note = {
  id: string;
  content: string;
  position: number;
  background_color: string;
  text_color: string;
  emoji?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type NewNote = Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export type NoteUpdate = Partial<Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

export type NotePosition = {
  id: string;
  position: number;
};