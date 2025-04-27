import React, { useState, useMemo } from "react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorModalProps {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  colorMap: Record<string, string>;
}

const TagSelectorModal: React.FC<TagSelectorModalProps> = ({ open, onClose, tags, selectedTagIds, onChange, colorMap }) => {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTagIds);

  // Keep localSelected in sync with selectedTagIds when modal opens
  React.useEffect(() => {
    if (open) setLocalSelected(selectedTagIds);
  }, [open, selectedTagIds]);

  const filteredTags = useMemo(() =>
    tags.filter(tag => tag.name.toLowerCase().includes(search.toLowerCase())),
    [tags, search]
  );

  const toggleTag = (id: string) => {
    if (localSelected.includes(id)) {
      setLocalSelected(localSelected.filter(tid => tid !== id));
    } else {
      setLocalSelected([...localSelected, id]);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg p-6 w-full max-w-md relative flex flex-col gap-4">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">Select Tags</h2>
        <input
          className="border-b border-gray-400 bg-transparent px-2 py-1 text-base focus:outline-none mb-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tags..."
        />
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {filteredTags.length === 0 && <div className="text-gray-500 text-sm">No tags found.</div>}
          {filteredTags.map(tag => (
            <label key={tag.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSelected.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              <span className="px-3 py-1 rounded-full text-sm font-medium border-2" style={{ backgroundColor: colorMap[tag.color], color: '#fff' }}>{tag.name}</span>
            </label>
          ))}
        </div>
        <button
          className="mt-2 bg-violet-600 text-white font-semibold rounded-lg px-6 py-2 hover:bg-violet-700 transition shadow-lg self-end"
          onClick={() => { onChange(localSelected); onClose(); }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default TagSelectorModal; 