import { isDev } from '../utils/env';
import { supabase } from '../supabase/client';
import { mockNotesService } from './mock-notes';
import type { Note, NewNote, NoteUpdate, NotePosition } from '../../components/Notes/types';

class NotesService {
  private service = isDev ? mockNotesService : undefined;

  clearNotes(): void {
    if (isDev && this.service) {
      this.service.clearNotes();
    }
  }

  async getNotes(userId?: string): Promise<Note[]> {
    if (isDev) {
      return this.service?.getNotes(userId) || [];
    }
    
    let query = supabase
      .from('notes')
      .select('*');
      
    // Filter by user_id if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('position', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createNote(userId: string, note: NewNote): Promise<Note> {
    if (isDev) {
      return this.service?.createNote(userId, note) || Promise.reject(new Error('Service not initialized'));
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNote(userId: string, noteId: string, updates: NoteUpdate): Promise<void> {
    if (isDev) {
      return this.service?.updateNote(userId, noteId, updates);
    }

    // Add retry logic for production
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const { error } = await supabase
          .from('notes')
          .update(updates)
          .eq('id', noteId)
          .eq('user_id', userId);

        if (error) {
          console.error(`Update attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        return; // Success
      } catch (error) {
        if (retryCount === maxRetries - 1) throw error;
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    if (isDev) {
      return this.service?.deleteNote(userId, noteId);
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updatePositions(userId: string, updates: NotePosition[]): Promise<void> {
    if (isDev) {
      return this.service?.updatePositions(userId, updates);
    }
    
    // Update positions one by one since we don't have the RPC function in production
    try {
      await Promise.all(updates.map(({ id, position }) => 
        supabase
          .from('notes')
          .update({ position })
          .eq('id', id)
          .eq('user_id', userId)
      ));
    } catch (error) {
      console.error('Error updating positions:', error);
      throw error;
    }
  }

  subscribe(userId: string, callback: () => void): () => void {
    if (isDev) {
      return this.service?.subscribe(callback) || (() => {});
    }

    const channelName = 'notes_public';

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notesService = new NotesService();