import React, { useState, useCallback } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { Note as NoteType } from './types';
import NoteEditor from './NoteEditor';
import { isDev } from '../../lib/utils/env';

type Props = {
  note: NoteType;
  index: number;
  onUpdate: (id: string, updates: Partial<NoteType>) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
};

export default function Note({ note, index, onUpdate, onDelete, isReadOnly = false }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In dev mode, skip confirmation
    if (isDev || window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  }, [note.id, onDelete]);

  return (
    <>
      {isReadOnly ? (
        <div
          className="group relative p-4 sm:p-6 rounded-xl shadow transition-all duration-300 
            hover:shadow-lg transform hover:-translate-y-1 bg-white/95 backdrop-blur-sm"
          style={{
            backgroundColor: note.background_color,
            color: note.text_color,
            minHeight: '120px'
          }}
        >
          <p className="whitespace-pre-wrap break-words text-base sm:text-lg leading-relaxed">{note.content}</p>
        </div>
      ) : (
        <div className="group">
          <div 
            className="relative p-4 sm:p-6 rounded-xl shadow-lg
              transition-all duration-300 transform 
              bg-white/95 backdrop-blur-sm
              hover:shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: note.background_color,
              color: note.text_color,
              minHeight: '120px'
            }}
          >
            <p className="whitespace-pre-wrap break-words text-base sm:text-lg leading-relaxed">
              {note.content}
            </p>
            <div className="flex justify-end gap-1 mt-4 sm:opacity-0 
              sm:group-hover:opacity-100 transition-opacity duration-200"
            >
              <button
                onClick={handleEdit}
                className="flex items-center p-2 rounded-lg transition-all 
                  duration-200 hover:text-purple-600 active:text-purple-700
                  bg-white/90 backdrop-blur-sm shadow-sm
                  hover:bg-black/5 active:bg-black/10"
                aria-label="Edit note"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center p-2 rounded-lg transition-all 
                  duration-200 text-gray-400 hover:text-red-500 active:text-red-600
                  bg-white/90 backdrop-blur-sm shadow-sm
                  hover:bg-black/5 active:bg-black/10"
                aria-label="Delete note"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <NoteEditor
          note={note}
          onSave={onUpdate}
          onClose={handleClose}
        />
      )}
    </>
  );
}