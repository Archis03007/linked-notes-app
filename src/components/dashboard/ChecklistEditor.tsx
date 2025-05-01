import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({ items, onChange }) => {

  const handleItemChange = (id: string, newText: string) => {
    onChange(items.map(item => item.id === id ? { ...item, text: newText } : item));
  };

  const handleCheckboxChange = (id: string) => {
    onChange(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddItem = () => {
    // Check if there are any items and if the last one is empty
    if (items.length > 0 && items[items.length - 1].text.trim() === '') {
      return; // Don't add a new item if the last one is empty
    }
    onChange([...items, { id: crypto.randomUUID(), text: '', checked: false }]);
    // Optional: Focus the new item input shortly after adding
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.checklist-item-input');
      inputs[inputs.length - 1]?.focus();
    }, 50);
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddItem();
    } else if (event.key === 'Backspace' && event.currentTarget.value === '') {
      // Prevent deleting the last item if it's empty
      if (items.length > 1) {
        event.preventDefault();
        handleDeleteItem(id);
        // Optional: Focus the previous item
        const index = items.findIndex(item => item.id === id);
        if (index > 0) {
          setTimeout(() => {
            const inputs = document.querySelectorAll<HTMLInputElement>('.checklist-item-input');
            inputs[index - 1]?.focus();
          }, 50);
        }
      }
    }
  };

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  const renderItem = (item: ChecklistItem) => (
    <div key={item.id} className="flex items-center gap-2 group mb-1">
      {/* <GripVertical className="w-4 h-4 text-gray-400 cursor-grab invisible group-hover:visible" /> */}
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => handleCheckboxChange(item.id)}
        className={`appearance-none w-4 h-4 border-2 border-violet-500 dark:border-violet-500 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 cursor-pointer accent-violet-600 
          ${item.checked ? 'bg-violet-600' : 'bg-transparent'}
        `}
      />
      <input
        type="text"
        value={item.text}
        onChange={(e) => handleItemChange(item.id, e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, item.id)}
        placeholder="List item"
        className={`checklist-item-input flex-1 bg-transparent border-0 focus:outline-none text-base p-1 ${
          item.checked 
            ? 'line-through text-gray-500 dark:text-gray-400' 
            : 'text-gray-900 dark:text-gray-100'
        }`}
      />
      <button
        onClick={() => handleDeleteItem(item.id)}
        className="text-gray-400 hover:text-red-500 invisible group-hover:visible p-1"
        aria-label="Delete item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-2 mt-4">
      {/* Unchecked Items */}
      {uncheckedItems.map(renderItem)}

      {/* Add Item Button */}
      <div className="pl-6"> {/* Indent add button */} 
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition p-1"
        >
          <Plus className="w-4 h-4" />
          List item
        </button>
      </div>

      {/* Checked Items Separator and Section */}
      {checkedItems.length > 0 && (
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {checkedItems.length} Completed item{checkedItems.length > 1 ? 's' : ''}
          </p>
          {checkedItems.map(renderItem)}
        </div>
      )}
    </div>
  );
};

export default ChecklistEditor; 