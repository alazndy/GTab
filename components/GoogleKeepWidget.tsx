import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Note {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = 'gtab_quick_notes';

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const GoogleKeepWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (isAdding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding]);

  const addNote = () => {
    const text = newText.trim();
    if (!text) {
      setIsAdding(false);
      return;
    }
    const note: Note = { id: crypto.randomUUID(), text, createdAt: Date.now() };
    setNotes(prev => [note, ...prev]);
    setNewText('');
    setIsAdding(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - ts;
    if (diff < 60_000) return 'Az önce';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}d önce`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
        <DocumentTextIcon className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span className="flex-1 text-xs font-medium text-white/80">Notlar</span>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-white/30 hover:text-yellow-300 transition-colors"
          title="Not ekle"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add note input */}
      {isAdding && (
        <div className="p-2 border-b border-white/10 shrink-0">
          <textarea
            ref={textareaRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); }
              if (e.key === 'Escape') { setIsAdding(false); setNewText(''); }
            }}
            onBlur={addNote}
            placeholder="Not yaz... (Enter ile kaydet)"
            rows={3}
            className="w-full bg-white/5 border border-yellow-400/20 rounded-lg px-2 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none focus:border-yellow-400/40 resize-none transition-colors"
          />
        </div>
      )}

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {notes.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <DocumentTextIcon className="w-8 h-8 text-yellow-400/20" />
            <div>
              <p className="text-xs font-medium text-white/40">Henüz not yok</p>
              <p className="text-[10px] text-white/20 mt-0.5">+ butonuna bas veya tıkla</p>
            </div>
          </div>
        )}
        {notes.map(note => (
          <div
            key={note.id}
            className="group relative bg-white/5 hover:bg-white/8 border border-white/5 hover:border-yellow-400/20 rounded-lg px-2.5 py-2 transition-all"
          >
            <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed pr-4">{note.text}</p>
            <p className="text-[10px] text-white/25 mt-1">{formatDate(note.createdAt)}</p>
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-1.5 right-1.5 p-0.5 text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleKeepWidget;
