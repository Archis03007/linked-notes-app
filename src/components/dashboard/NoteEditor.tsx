import React, { useEffect, useRef, useMemo } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mark, markInputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import Placeholder from '@tiptap/extension-placeholder';
import ChecklistEditor, { ChecklistItem } from './ChecklistEditor';

// Create the plugin once, with a callback for onLinkClick
function createBacklinkClickPlugin(onLinkClick: (text: string) => void) {
  return new Plugin({
    props: {
      handleClickOn(view: any, pos: number, node: any, nodePos: number, event: MouseEvent, direct: boolean) {
        if ((event.target as HTMLElement).getAttribute('data-backlink') !== null) {
          const text = (event.target as HTMLElement).textContent || '';
          if (typeof onLinkClick === 'function') {
            onLinkClick(text);
          }
          return true;
        }
        return false;
      }
    }
  });
}

// Custom mark for [[...]]
export const BacklinkMark = Mark.create({
  name: 'backlink',
  parseHTML() {
    return [{ tag: 'span[data-backlink]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-backlink': '', style: 'color: #a78bfa; cursor: pointer;' }, 0];
  },
  addInputRules() {
    return [
      markInputRule({
        find: /\[\[([^\]\s]+)\]\]$/,
        type: this.type,
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [createBacklinkClickPlugin(this.options.onLinkClick)];
  }
});

// Define types (ensure they match CreateNoteForm and page.tsx)
export interface EditableNote {
  id: string;
  title: string;
  subtitle: string;
  content: string | ChecklistItem[];
  type: 'text' | 'task' | 'checklist';
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  type: 'text' | 'task' | 'checklist';
}

interface NoteEditorProps {
  note: Note;
  onChange: (note: Partial<EditableNote>) => void;
  onUpdate: () => void;
  updating: boolean;
  updateError: string | null;
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  colorMap: Record<string, string>;
  onOpenTagSelector: () => void;
  notes: Note[];
  onLinkClick: (title: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onChange, 
  onUpdate, 
  updating, 
  updateError, 
  tags, 
  selectedTagIds, 
  onTagsChange, 
  colorMap, 
  onOpenTagSelector, 
  notes, 
  onLinkClick 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BacklinkMark.configure({
        onLinkClick: onLinkClick,
      }),
      Placeholder.configure({
        placeholder: note.type === 'text'
          ? 'Write your note here...   type [[...]] for backlinks.'
          : note.type === 'task'
          ? 'Describe your task here...'
          : '',
      }),
    ],
    content: note.type === 'checklist' ? '' : note.content,
    onUpdate({ editor }) {
      if (note.type !== 'checklist') {
        onChange({ id: note.id, content: editor.getHTML() });
      }
    },
    editable: note.type !== 'checklist',
  });

  useEffect(() => {
    if (editor && note.type !== 'checklist' && note.content !== editor.getHTML()) {
      const contentString = typeof note.content === 'string' ? note.content : '';
      editor.commands.setContent(contentString || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.content, note.type, editor]);

  const checklistItems = useMemo(() => {
    if (note.type !== 'checklist') return [];
    try {
      const parsed = JSON.parse(note.content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse checklist content:", e);
      return [];
    }
  }, [note.content, note.type]);

  const handleChecklistChange = (updatedItems: ChecklistItem[]) => {
    onChange({ id: note.id, content: updatedItems });
  };

  const removeTag = (id: string) => {
    onTagsChange(selectedTagIds.filter(tid => tid !== id));
  };

  return (
    <>
      <input
        className="text-3xl font-bold bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 mb-2 px-0"
        value={note.title}
        onChange={e => onChange({ id: note.id, title: e.target.value })}
        placeholder={
          note.type === 'text'
            ? "Title"
            : note.type === 'task'
            ? "Task title"
            : "Checklist title"
        }
      />
      <input
        className="text-xl bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-400 mb-2 px-0"
        value={note.subtitle}
        onChange={e => onChange({ id: note.id, subtitle: e.target.value })}
        placeholder={
          note.type === 'text'
            ? "Subtitle"
            : note.type === 'task'
            ? "Task description"
            : "Checklist description"
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
      {note.type === 'checklist' ? (
        <ChecklistEditor items={checklistItems} onChange={handleChecklistChange} />
      ) : (
        <EditorContent
          editor={editor}
          className="bg-transparent border-0 rounded p-0 focus:outline-none text-base min-h-[40px]"
        />
      )}
      {updateError && <div className="text-red-600 text-sm">{updateError}</div>}
      <button
        className="mt-4 bg-violet-600 text-white font-semibold rounded-lg px-6 py-2 hover:bg-violet-700 transition shadow-lg self-end"
        onClick={onUpdate}
        disabled={updating}
      >
        {updating ? "Updating..." : "Update"}
      </button>
    </>
  );
};

export default NoteEditor; 