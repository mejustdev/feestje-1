import React, { useState, useEffect, useCallback, forwardRef, memo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { notesService } from '../../lib/services/notes';
import { useAuth } from '../../lib/auth/hooks'; 
import { isDev } from '../../lib/utils/env';
import Note from './Note';
import type { Note as NoteType, NewNote, NoteUpdate, NotePosition } from './types';

const DEFAULT_COLORS = {
  background_color: '#ffe4b5',
  text_color: '#000000'
};

const ERROR_TIMEOUT = 3000; // 3 seconds

export default function NotesGrid() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Only clear notes when user signs out
    return () => {
      if (isDev && !user) {
        notesService.clearNotes();
      }
    };
  }, [user]);

  // Auto-dismiss error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, ERROR_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadNotes = useCallback(async () => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Load user's notes when authenticated, all notes when not
      const notes = await notesService.getNotes(user?.id);
      setNotes(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError('Kon notities niet laden');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setIsInitialLoad(true);
    loadNotes();

    // Set up subscription for real-time updates
    let timeoutId: NodeJS.Timeout;
    const handleUpdate = async () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const notes = await notesService.getNotes();
          setNotes(notes);
          setError(null);
        } catch (error) {
          console.error('Failed to update notes:', error);
          setError('Failed to load notes');
        }
      }, 500); // Debounce updates
    };

    // Subscribe to all notes changes for real-time updates
    const unsubscribe = notesService.subscribe('', handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const createNote = async () => {
    if (!user) return;

    // Check if user has reached the limit
    const userNotes = notes.filter(note => note.user_id === user.id);
    if (userNotes.length >= 2) {
      setError('Je kunt maximaal 2 notities maken');
      return;
    }

    // Prevent duplicate creation
    if (isLoading) return;
    setError(null);

    try {
      // Calculate next position safely
      const nextPosition = notes.length > 0
        ? Math.max(...notes.map(n => n.position)) + 1
        : 0;

      await notesService.createNote(user.id, {
        content: 'Nieuwe notitie',
        position: nextPosition,
        ...DEFAULT_COLORS,
      });
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Kon notitie niet maken');
    }
  };

  const updateNote = async (id: string, updates: NoteUpdate) => {
    if (!user) return;

    // Optimistic update
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));

    try {
      await notesService.updateNote(user.id, id, updates);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Kon notitie niet bijwerken');
      loadNotes(); // Revert changes on error
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    setError(null);

    try {
      setNotes(prev => prev.filter(note => note.id !== id));
      await notesService.deleteNote(user.id, id);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Kon notitie niet verwijderen');
      // Revert optimistic update
      loadNotes();
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !user) return;

    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions in the UI
    setNotes(items.map((item, index) => ({ ...item, position: index })));

    // Update positions in the database
    const updates: NotePosition[] = items.map((item, index) => ({
      id: item.id,
      position: index
    }));

    try {
      await notesService.updatePositions(user.id, updates);
    } catch (error) {
      console.error('Error updating positions:', error);
      loadNotes();
    }
  };

  return (
    <div className="p-6 bg-white/95 rounded-xl shadow-lg transition-all relative">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2">
            Notities ✨
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {user 
              ? `Klik om te bewerken (${notes.filter(n => n.user_id === user.id).length}/2 notities)`
              : 'Log in om notities te maken'}
          </p>
        </div>
        <button
          onClick={createNote}
          className={`p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg
            transition-all transform hover:scale-110 hover:rotate-180 
            ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
          disabled={!user}
          title={user ? 'Nieuwe notitie toevoegen' : 'Log in om notities toe te voegen'}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg animate-shake animate-fade-out">
          {error}
        </div>
      )}

      <div className="relative">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600 animate-pulse">
            Notities laden...
          </div>
        ) : user ? (
          <div className="flex flex-wrap gap-4">
            {notes.sort((a, b) => a.position - b.position).map((note, index) => (
              <div key={note.id} className="w-full sm:w-[calc(50%-0.5rem)]">
                <Note
                  note={note}
                  index={index}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  isReadOnly={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {notes.sort((a, b) => a.position - b.position).map((note) => (
              <div key={note.id} className="w-full sm:w-[calc(50%-0.5rem)]">
                <Note
                  note={note}
                  index={0}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  isReadOnly={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}