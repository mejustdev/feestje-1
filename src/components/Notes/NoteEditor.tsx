import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { X, Smile, Palette, Loader2, Save } from 'lucide-react';
import type { Note, NoteUpdate } from './types';

const DEBOUNCE_DELAY = 500; // 500ms delay for auto-save

type Props = {
  note: Note;
  onSave: (id: string, updates: NoteUpdate) => void;
  onClose: () => void;
};

export default function NoteEditor({ note, onSave, onClose }: Props) {
  const [content, setContent] = useState(note.content);
  const [backgroundColor, setBackgroundColor] = useState(note.background_color || '#FFE4B5');
  const [textColor, setTextColor] = useState(note.text_color);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const MAX_LENGTH = 150;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleColorChange = (color: string, isBackground: boolean) => {
    if (isBackground) {
      setBackgroundColor(color);
    } else {
      setTextColor(color);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (content.length > MAX_LENGTH) {
      setError(`Note cannot exceed ${MAX_LENGTH} characters`);
      return;
    }
    
    if (isSaving) return;
    
    setError(null);
    setIsSaving(true);
    
    try {
      const updates = {
        content,
        background_color: backgroundColor || '#FFE4B5',
        text_color: textColor || '#000000',
      };
      await onSave(note.id, updates);
      onClose();
      setHasChanges(false);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      throw err; // Re-throw to trigger error handling in parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (content.length + 2 > MAX_LENGTH) {
      setError(`Adding emoji would exceed ${MAX_LENGTH} characters`);
      return;
    }
    setContent(prev => {
      const newContent = prev + emoji.native;
      setHasChanges(true);
      return newContent;
    });
    setShowEmojiPicker(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md relative animate-scale-up my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 
            transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-purple-600 mb-6">Edit Note</h2>

        <div className="space-y-4">
          <textarea
            value={content}
            onChange={handleContentChange}
            maxLength={MAX_LENGTH}
            className="w-full p-2 sm:p-3 border rounded-lg resize-none focus:ring-2 
              focus:ring-purple-500 focus:border-transparent transition-shadow"
            rows={4}
            style={{ backgroundColor, color: textColor }}
            placeholder={`Write your note here (max ${MAX_LENGTH} characters)`}
          />
          <div className="flex justify-between text-sm">
            <span className={`${content.length >= MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
              {content.length}/{MAX_LENGTH}
            </span>
            {error && <span className="text-red-500">{error}</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors
                  transform hover:scale-110"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="fixed inset-0 sm:relative sm:inset-auto flex items-center justify-center sm:mt-2 z-10 p-4 sm:p-0">
                  <div className="space-y-2">
                    <HexColorPicker 
                      color={backgroundColor} 
                      onChange={(color) => handleColorChange(color, true)} 
                    />
                    <HexColorPicker 
                      color={textColor} 
                      onChange={(color) => handleColorChange(color, false)} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors
                  transform hover:scale-110"
              >
                <Smile />
              </button>
              {showEmojiPicker && (
                <div className="absolute right-0 mt-2 z-10">
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700
              transition-all transform hover:translate-y-[-2px] hover:shadow-lg relative
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : hasChanges ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                No Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}