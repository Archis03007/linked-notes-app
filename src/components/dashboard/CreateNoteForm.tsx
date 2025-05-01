import React, { useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BacklinkMark } from './NoteEditor';
import Placeholder from '@tiptap/extension-placeholder';
import ChecklistEditor, { ChecklistItem } from './ChecklistEditor';

interface Note {
  title: string;
  subtitle: string;
  content: string;
  type: 'text' | 'task' | 'checklist';
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
  onLinkClick: (title: string) => void;
}

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({ newNote, onChange, onSave, saving, error, tags, selectedTagIds, onTagsChange, colorMap, onOpenTagSelector, onLinkClick }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BacklinkMark.configure({
        onLinkClick: onLinkClick,
      }),
      Placeholder.configure({
        placeholder: newNote.type === 'text' 
          ? 'Write your note here...   type [[...]] for backlinks.'
          : newNote.type === 'task'
          ? 'Describe your task here...'
          : '',
      }),
    ],
    content: newNote.content || '',
    onUpdate({ editor }) {
      if (newNote.type !== 'checklist') {
        onChange({ ...newNote, content: editor.getHTML() });
      }
    },
    autofocus: newNote.type !== 'checklist',
    editable: newNote.type !== 'checklist',
  });

  useEffect(() => {
    if (editor && newNote.type !== 'checklist' && newNote.content !== editor.getHTML()) {
      editor.commands.setContent(newNote.content || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNote.content, newNote.type, editor]);

  const checklistItems = useMemo(() => {
    if (newNote.type !== 'checklist') return [];
    try {
      const parsed = JSON.parse(newNote.content);
      return Array.isArray(parsed) ? parsed : []; 
    } catch (e) {
      console.error("Failed to parse checklist content:", e);
      return [];
    }
  }, [newNote.content, newNote.type]);

  const handleChecklistChange = (updatedItems: ChecklistItem[]) => {
    onChange({ ...newNote, content: JSON.stringify(updatedItems) });
  };

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
        placeholder={
          newNote.type === 'text' 
            ? "Enter note title..." 
            : newNote.type === 'task'
            ? "Enter task title..."
            : "Enter checklist title..."
        }
        autoFocus={newNote.type === 'checklist'}
      />
      <input
        className="text-xl bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-400 mb-2 px-0"
        value={newNote.subtitle}
        onChange={e => onChange({ ...newNote, subtitle: e.target.value })}
        placeholder={
          newNote.type === 'text'
            ? "Enter subtitle..."
            : newNote.type === 'task'
            ? "Enter task description..."
            : "Enter checklist description..."
        }
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
      {newNote.type === 'checklist' ? (
        <ChecklistEditor items={checklistItems} onChange={handleChecklistChange} />
      ) : (
        <EditorContent
          editor={editor}
          className="ProseMirror bg-transparent border-0 rounded p-0 focus:outline-none text-base min-h-[40px]"
        />
      )}
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