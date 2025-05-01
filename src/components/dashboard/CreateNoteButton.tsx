import React, { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";

export type NoteType = 'text' | 'task' | 'checklist';

interface CreateNoteButtonProps {
  onClick: (type: NoteType) => void;
  disabled?: boolean;
}

const CreateNoteButton: React.FC<CreateNoteButtonProps> = ({ onClick, disabled }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const noteTypes: { type: NoteType; label: string }[] = [
    { type: 'text', label: 'Text Note' },
    { type: 'task', label: 'Task' },
    { type: 'checklist', label: 'Checklist' },
  ];

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white font-bold rounded-l-lg px-4 py-2 text-base hover:bg-violet-700 transition shadow-md h-10"
          onClick={() => onClick('text')}
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
        <button
          className="flex items-center justify-center bg-violet-600 text-white font-bold rounded-r-lg px-2 py-2 hover:bg-violet-700 transition shadow-md h-10 border-l border-violet-500"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
      
      {showDropdown && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {noteTypes.map(({ type, label }) => (
            <button
              key={type}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                onClick(type);
                setShowDropdown(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateNoteButton; 