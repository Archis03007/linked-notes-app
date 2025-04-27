import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mark, markInputRule } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import Placeholder from '@tiptap/extension-placeholder';

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

interface EditableNote {
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

interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

interface NoteEditorProps {
  note: Note;
  onChange: (note: EditableNote) => void;
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

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange, onUpdate, updating, updateError, tags, selectedTagIds, onTagsChange, colorMap, onOpenTagSelector, notes, onLinkClick }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tiptap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      BacklinkMark.configure({
        onLinkClick: onLinkClick,
      }),
      Placeholder.configure({
        placeholder: 'Write your note here...'
      })
    ],
    content: note.content,
    onUpdate({ editor }) {
      onChange({ id: note.id, title: note.title, subtitle: note.subtitle, content: editor.getHTML() });
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

  // Function to re-parse the editor content and apply backlink marks to all [[...]] patterns
  function reparsedBacklinks(editor: any) {
    const html = editor.getHTML();
    // Replace all [[...]] with just the inner text wrapped in a span
    const newHtml = html.replace(/\[\[(.*?)\]\]/g, (_match: string, p1: string) => `<span data-backlink style="color: #a78bfa; cursor: pointer;">${p1}</span>`);
    editor.commands.setContent(newHtml);
  }

  return (
    <>
      <input
        className="text-3xl font-bold bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 mb-2 px-0"
        value={note.title}
        onChange={e => onChange({ id: note.id, title: e.target.value, subtitle: note.subtitle, content: note.content })}
        placeholder="Title"
      />
      <input
        className="text-xl bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-400 mb-2 px-0"
        value={note.subtitle}
        onChange={e => onChange({ id: note.id, title: note.title, subtitle: e.target.value, content: note.content })}
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