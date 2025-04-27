import React from "react";
import { Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
}

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  loading: boolean;
  onDeleteNote: (id: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ notes, selectedNoteId, onSelectNote, loading, onDeleteNote }) => (
  <div className="flex-1 overflow-y-auto mt-4 hide-scrollbar border-t border-gray-800 pt-4">
    {loading ? (
      <div className="text-gray-500 text-sm">Loading notes...</div>
    ) : notes.length === 0 ? (
      <div className="text-gray-500 text-sm">No notes yet.</div>
    ) : (
      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ${selectedNoteId === note.id ? 'bg-zync-800 text-purple-400' : 'bg-zync-900 text-gray-300 hover:bg-zync-800'}`}
          >
            <div className="flex-1 min-w-0" onClick={() => onSelectNote(note)}>
              <div className="font-bold text-base leading-tight truncate">{note.title || <span className="text-gray-400">Untitled</span>}</div>
              <div className="text-xs text-gray-400 truncate">{note.subtitle || <span className="text-gray-600">No subtitle</span>}</div>
              <div className="text-xs text-gray-500 mt-1">
                {(() => {
                  const date = new Date(note.created_at);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = date.toLocaleString(undefined, { month: 'short' });
                  const year = String(date.getFullYear()).slice(-2);
                  let hours = date.getHours();
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  return `${day}-${month}-${year} | ${hours}:${minutes} ${ampm}`;
                })()}
              </div>
            </div>
            <button
              className="ml-3 p-1 rounded hover:bg-red-100/10 dark:hover:bg-red-900/40 transition"
              title="Delete note"
              onClick={e => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this note?')) {
                  onDeleteNote(note.id);
                }
              }}
            >
              <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-500 transition" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default NotesList; 