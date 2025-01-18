import { Note, NewNote, NoteUpdate, NotePosition } from '../../components/Notes/types';

class MockNotesService {
  private notes: Note[] = [];
  private listeners = new Set<() => void>();
  private static instance: MockNotesService;

  constructor() {
    if (MockNotesService.instance) {
      return MockNotesService.instance;
    }
    MockNotesService.instance = this;
    console.log('[MockNotesService] Initialized');
  }

  clearNotes() {
    this.notes = [];
    this.notifyListeners();
    console.log('[MockNotesService] Notes cleared');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in note listener:', error);
      }
    });
  }

  async getNotes(userId?: string): Promise<Note[]> {
    console.log('[MockNotesService] Getting notes for user:', userId);
    const filteredNotes = userId
      ? this.notes.filter(note => note.user_id === userId)
      : this.notes;
      
    return filteredNotes
      .sort((a, b) => a.position - b.position);
  }

  async createNote(userId: string, note: NewNote): Promise<Note> {
    console.log('[MockNotesService] Creating note for user:', userId);
    const newNote: Note = {
      id: crypto.randomUUID(),
      user_id: userId,
      ...note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.notes.push(newNote);
    this.notifyListeners();
    console.log('[MockNotesService] Note created:', newNote.id);
    return newNote;
  }

  async updateNote(userId: string, noteId: string, updates: NoteUpdate): Promise<void> {
    console.log('[MockNotesService] Updating note:', noteId);
    const index = this.notes.findIndex(n => n.id === noteId && n.user_id === userId);
    if (index !== -1) {
      // Validate content length
      if (updates.content && updates.content.length > 150) {
        throw new Error('Content cannot exceed 150 characters');
      }

      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.notifyListeners();
      console.log('[MockNotesService] Note updated');
    } else {
      throw new Error('Note not found or unauthorized');
    }
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    console.log('[MockNotesService] Deleting note:', noteId);
    const index = this.notes.findIndex(n => n.id === noteId && n.user_id === userId);
    if (index !== -1) {
      this.notes.splice(index, 1);
      this.notifyListeners();
      console.log('[MockNotesService] Note deleted');
    } else {
      throw new Error('Note not found or unauthorized');
    }
  }

  async updatePositions(userId: string, updates: NotePosition[]): Promise<void> {
    console.log('[MockNotesService] Updating positions');
    updates.forEach(update => {
      const note = this.notes.find(n => n.id === update.id && n.user_id === userId);
      if (note) {
        note.position = update.position;
      }
    });
    this.notifyListeners();
  }

  subscribe(callback: () => void): () => void {
    console.log('[MockNotesService] New subscription added');
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const mockNotesService = new MockNotesService();