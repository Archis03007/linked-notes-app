import React, { useRef } from "react";

interface Note {
  title: string;
  subtitle: string;
  content: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CreateNoteFormProps {
  newNote: Note;
  onChange: (note: Note) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  colorMap: Record<string, string>;
  onOpenTagSelector: () => void;
}

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({ newNote, onChange, onSave, saving, error, tags, selectedTagIds, onTagsChange, colorMap, onOpenTagSelector }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...newNote, content: e.target.value });
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const removeTag = (id: string) => {
    onTagsChange(selectedTagIds.filter(tid => tid !== id));
  };

  return (
    <>
      <input
        className="text-3xl font-bold bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 mb-2 px-0"
        value={newNote.title}
        onChange={e => onChange({ ...newNote, title: e.target.value })}
        placeholder="Enter note title..."
      />
      <input
        className="text-xl bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-400 mb-2 px-0"
        value={newNote.subtitle}
        onChange={e => onChange({ ...newNote, subtitle: e.target.value })}
        placeholder="Enter subtitle..."
      />
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-2">
          {selectedTagIds.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm font-medium border-2 flex items-center gap-2 border-white"
                style={{ backgroundColor: colorMap[tag.color], color: '#fff' }}
              >
                {tag.name}
                <button
                  type="button"
                  className="ml-1 text-white hover:text-gray-200"
                  onClick={() => removeTag(tag.id)}
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
        <button
          type="button"
          className="ml-2 px-3 py-1 rounded-full bg-violet-700 text-white text-xs font-semibold hover:bg-violet-800 border border-violet-800 shadow-sm"
          onClick={onOpenTagSelector}
        >
          + Add Tags
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="bg-transparent border-0 rounded p-0 focus:outline-none focus:border-0 text-base resize-none overflow-hidden"
        value={newNote.content}
        onChange={handleContentChange}
        placeholder="Write your note here..."
        rows={1}
        style={{ minHeight: "40px" }}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        className="mt-4 bg-violet-600 text-white font-semibold rounded-lg px-6 py-2 hover:bg-violet-700 transition shadow-lg self-end"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </>
  );
};

export default CreateNoteForm; 