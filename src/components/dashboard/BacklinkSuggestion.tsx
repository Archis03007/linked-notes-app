import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionProps } from '@tiptap/suggestion';
import React from 'react';

export interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export const BacklinkSuggestion = Extension.create({
  name: 'backlinkSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '[[',
        startOfLine: false,
        items: (query: string, notes: Note[]): Note[] => {
          if (!query) return notes;
          return notes.filter(note =>
            note.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: HTMLDivElement | null = null;
          let popup: any = null;
          return {
            onStart: (props: SuggestionProps) => {
              component = document.createElement('div');
              document.body.appendChild(component);
              renderSuggestionList(component, props);
            },
            onUpdate: (props: SuggestionProps) => {
              if (component) renderSuggestionList(component, props);
            },
            onKeyDown: (props: SuggestionProps) => {
              // Handle keyboard navigation if needed
              return false;
            },
            onExit: () => {
              if (component) {
                component.remove();
                component = null;
              }
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        ...this.options.suggestion,
        items: (query: string) => this.options.suggestion.items(query, this.options.notes),
      }),
    ];
  },
});

// Helper to render the suggestion list
function renderSuggestionList(container: HTMLDivElement, props: SuggestionProps) {
  const { items, command } = props as any as { items: Note[]; command: (item: Note) => void };
  container.innerHTML = '';
  const ul = document.createElement('ul');
  ul.style.background = '#222';
  ul.style.color = '#fff';
  ul.style.padding = '8px';
  ul.style.borderRadius = '8px';
  ul.style.position = 'absolute';
  ul.style.zIndex = '1000';
  ul.style.listStyle = 'none';
  ul.style.margin = '0';
  ul.style.minWidth = '180px';
  items.forEach((item: Note, idx: number) => {
    const li = document.createElement('li');
    li.textContent = item.title;
    li.style.padding = '4px 8px';
    li.style.cursor = 'pointer';
    li.onmousedown = (e: MouseEvent) => {
      e.preventDefault();
      command(item);
    };
    ul.appendChild(li);
  });
  container.appendChild(ul);
} 