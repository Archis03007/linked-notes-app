import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mark } from '@tiptap/core';

// Custom mark for [[...]]
const BacklinkMark = Mark.create({
  name: 'backlink',
  parseHTML() {
    return [{ tag: 'span[data-backlink]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { ...HTMLAttributes, 'data-backlink': '', style: 'color: #a78bfa;' }, 0];
  },
  addInputRules() {
    return [
      {
        // Match [[text]] and only mark the inner text
        find: /\[\[(.*?)\]\]/g,
        handler: ({ state, range, match }: { state: import('prosemirror-state').EditorState, range: { from: number, to: number }, match: RegExpMatchArray }) => {
          const innerText = match[1];
          const { tr } = state;
          tr.delete(range.from, range.to);
          tr.insertText(innerText, range.from);
          tr.addMark(range.from, range.from + innerText.length, (this as any).type.create());
        }
      }
    ];
  }
});

interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface NoteEditorProps {
  note: Note;
  onChange: (note: Note) => void;
  onUpdate: () => void;
  updating: boolean;
  updateError: string | null;
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  colorMap: Record<string, string>;
  onOpenTagSelector: () => void;
  notes: Note[];
  onLinkClick: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange, onUpdate, updating, updateError, tags, selectedTagIds, onTagsChange, colorMap, onOpenTagSelector }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tiptap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      BacklinkMark.extend({
        addInputRules() {
          return [
            {
              find: /\[\[(.*?)\]\]/g,
              handler: ({ state, range, match }: { state: import('prosemirror-state').EditorState, range: { from: number, to: number }, match: RegExpMatchArray }) => {
                const innerText = match[1];
                const { tr } = state;
                tr.delete(range.from, range.to);
                tr.insertText(innerText, range.from);
                tr.addMark(range.from, range.from + innerText.length, (this as any).type.create());
              }
            }
          ];
        }
      })
    ],
    content: note.content,
    onUpdate({ editor }) {
      onChange({ ...note, content: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || '');
    }
    // eslint-disable-next-line
  }, [note.content]);

  const removeTag = (id: string) => {
    onTagsChange(selectedTagIds.filter(tid => tid !== id));
  };

  return (
    <>
      <input
        className="text-3xl font-bold bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 mb-2 px-0"
        value={note.title}
        onChange={e => onChange({ ...note, title: e.target.value })}
        placeholder="Title"
      />
      <input
        className="text-xl bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-400 mb-2 px-0"
        value={note.subtitle}
        onChange={e => onChange({ ...note, subtitle: e.target.value })}
        placeholder="Subtitle"
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
      <EditorContent
        editor={editor}
        className="bg-transparent border-0 rounded p-0 focus:outline-none text-base min-h-[40px]"
      />
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