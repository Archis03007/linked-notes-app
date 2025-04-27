import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative mb-4">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <Search className="w-5 h-5" />
    </span>
    <input
      type="text"
      placeholder="Search..."
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-zync-900 text-gray-100 placeholder-gray-400"
    />
  </div>
);

export default SearchBar; 