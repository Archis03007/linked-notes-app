import React, { memo } from "react";
import { Trash2 } from "lucide-react";
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

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

// Memoized note item component to prevent unnecessary re-renders
const NoteItem = memo(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete 
}: { 
  note: Note; 
  isSelected: boolean; 
  onSelect: () => void; 
  onDelete: () => void;
}) => (
  <li
    className={`group flex items-center justify-between px-4 py-2 rounded-lg transition-colors cursor-pointer ${
      isSelected ? 'bg-zync-800 text-purple-400 hover:text-purple-500' : 'bg-zync-900 text-gray-300 hover:text-purple-300 hover:bg-zync-800'
    }`}
    onClick={onSelect}
  >
    <div className="flex-1 min-w-0">
      <div className="font-bold text-base leading-tight truncate">
        {note.title || <span className="text-gray-400">Untitled</span>}
      </div>
      <div className="text-xs text-gray-400 truncate">
        {note.subtitle || <span className="text-gray-600">No subtitle</span>}
      </div>
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
          hours = hours ? hours : 12;
          return `${day}-${month}-${year} | ${hours}:${minutes} ${ampm}`;
        })()}
      </div>
    </div>
    <button
      className="ml-2 p-2 rounded hover:bg-red-100/10 dark:hover:bg-red-900/40 transition"
      title="Delete note"
      onClick={(e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
          onDelete();
        }
      }}
    >
      <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-500 transition" />
    </button>
  </li>
));

NoteItem.displayName = 'NoteItem';

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  selectedNoteId, 
  onSelectNote, 
  loading, 
  onDeleteNote 
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76, // Estimated height of each note item
    overscan: 5, // Number of items to render outside the visible area
  });

  if (loading) {
    return <div className="text-gray-500 text-sm px-4">Loading notes...</div>;
  }

  if (notes.length === 0) {
    return <div className="text-gray-500 text-sm px-4">No notes yet.</div>;
  }

  return (
    <div 
      ref={parentRef} 
      className="flex-1 overflow-y-auto mt-4 hide-scrollbar border-t border-gray-800 pt-4"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const note = notes[virtualRow.index];
          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <NoteItem
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => onSelectNote(note)}
                onDelete={() => onDeleteNote(note.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(NotesList); 