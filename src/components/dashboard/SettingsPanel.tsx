import React from 'react';
import Modal from '@/components/Modal';
import { Check, Plus } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settingsSection: 'personal' | 'tags';
  setSettingsSection: (section: 'personal' | 'tags') => void;
  nameInput: string;
  setNameInput: (name: string) => void;
  nameSaving: boolean;
  handleSaveName: () => void;
  displayName: string;
  tags: Tag[];
  tagName: string;
  setTagName: (name: string) => void;
  tagColor: string;
  setTagColor: (color: string) => void;
  tagLoading: boolean;
  handleCreateOrUpdateTag: () => void;
  editingTagId: string | null;
  setEditingTagId: (id: string | null) => void;
  handleEditTag: (tag: Tag) => void;
  handleDeleteTag: (id: string) => void;
  TAILWIND_COLORS: string[];
  COLOR_MAP: Record<string, string>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onClose,
  settingsSection,
  setSettingsSection,
  nameInput,
  setNameInput,
  nameSaving,
  handleSaveName,
  displayName,
  tags,
  tagName,
  setTagName,
  tagColor,
  setTagColor,
  tagLoading,
  handleCreateOrUpdateTag,
  editingTagId,
  setEditingTagId,
  handleEditTag,
  handleDeleteTag,
  TAILWIND_COLORS,
  COLOR_MAP,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Settings"
    leftPanel={
      <div className="flex flex-col gap-2 h-full w-64 pt-8 px-6 bg-zinc-900 border-r border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold">Settings</span>
          <button
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors"
            onClick={onClose}
            aria-label="Close settings"
          >
            &times;
          </button>
        </div>
        <button
          className={`w-full text-left px-3 py-2 rounded font-medium transition-colors ${settingsSection === 'personal' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-800'}`}
          onClick={() => setSettingsSection('personal')}
        >
          Personal
        </button>
        <button
          className={`w-full text-left px-3 py-2 rounded font-medium transition-colors ${settingsSection === 'tags' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300 hover:bg-zinc-800'}`}
          onClick={() => setSettingsSection('tags')}
        >
          Manage Tags
        </button>
      </div>
    }
    rightPanel={
      <div className="flex flex-col h-full w-full p-12 overflow-y-auto">
        {settingsSection === 'personal' ? (
          <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
            <label className="text-sm font-medium text-zinc-200">Change your name</label>
            <input
              className="border-b border-zinc-600 bg-transparent px-2 py-1 text-lg focus:outline-none text-zinc-100 placeholder-zinc-400"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Enter your name"
              disabled={nameSaving}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSaveName}
                disabled={nameSaving || !nameInput.trim()}
              >
                {nameSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="text-zinc-400 px-4 py-2"
                onClick={() => { setNameInput(displayName); onClose(); }}
                disabled={nameSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-zinc-100">Manage Tags</h3>
            <form
              className="flex flex-col gap-4"
              onSubmit={e => { e.preventDefault(); handleCreateOrUpdateTag(); }}
            >
              <input
                className="border-b border-zinc-600 bg-transparent px-2 py-1 text-base focus:outline-none text-zinc-100 placeholder-zinc-400"
                value={tagName}
                onChange={e => setTagName(e.target.value)}
                placeholder="Tag name"
                required
                disabled={tagLoading}
              />
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-300">Color:</span>
                <div className="flex flex-wrap gap-2">
                  {TAILWIND_COLORS.map(color => (
                    <button
                      type="button"
                      key={color}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${tagColor === color ? 'ring-2 ring-zinc-100' : ''}`}
                      style={{ backgroundColor: COLOR_MAP[color] }}
                      onClick={() => setTagColor(color)}
                      aria-label={color}
                      disabled={tagLoading}
                    >
                      {tagColor === color && <Check className="w-4 h-4 text-zinc-100" />}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="bg-violet-600 text-white rounded px-4 py-2 mt-2 hover:bg-violet-700 disabled:opacity-50 self-start flex items-center gap-2"
                disabled={tagLoading || !tagName.trim()}
              >
                <Plus className="w-4 h-4" />
                {editingTagId ? 'Update Tag' : 'Add Tag'}
              </button>
              {editingTagId && (
                <button
                  type="button"
                  className="text-zinc-400 text-xs mt-1 self-start"
                  onClick={() => { setEditingTagId(null); setTagName(""); setTagColor(TAILWIND_COLORS[0]); }}
                  disabled={tagLoading}
                >
                  Cancel Edit
                </button>
              )}
            </form>
            <ul className="flex flex-col gap-2">
              {tags.map(tag => (
                <li key={tag.id} className="flex items-center gap-3 group">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_MAP[tag.color] }} />
                  <span className="flex-1 truncate text-zinc-100">{tag.name}</span>
                  <button
                    className="text-blue-400 text-xs hover:underline mr-2"
                    onClick={() => handleEditTag(tag)}
                    disabled={tagLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 text-xs hover:underline"
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={tagLoading}
                  >
                    Delete
                  </button>
                </li>
              ))}
              {tags.length === 0 && <li className="text-zinc-500 text-sm">No tags yet.</li>}
            </ul>
          </div>
        )}
      </div>
    }
  />
);

export default SettingsPanel; 