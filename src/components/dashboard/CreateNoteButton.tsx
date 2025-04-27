import React from "react";
import { Plus } from "lucide-react";

interface CreateNoteButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CreateNoteButton: React.FC<CreateNoteButtonProps> = ({ onClick, disabled }) => (
  <button
    className="w-full flex items-center justify-center gap-2 mb-2 bg-violet-600 text-white font-bold rounded-lg px-4 py-3 text-base hover:bg-violet-700 transition shadow-md"
    onClick={onClick}
    disabled={disabled}
  >
    <Plus className="w-5 h-5" />
    New Note
  </button>
);

export default CreateNoteButton; 