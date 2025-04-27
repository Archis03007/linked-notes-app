import React from "react";
import { Settings } from "lucide-react";

interface SidebarProps {
  children?: React.ReactNode;
  onOpenSettings?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ children, onOpenSettings }) => (
  <aside className="w-72 bg-gray-950 text-gray-100 p-5 flex flex-col gap-5 border-r border-gray-800 min-h-screen max-h-screen sticky top-0 md:relative shadow-xl relative">
    <button
      className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
      aria-label="Settings"
      onClick={onOpenSettings}
    >
      <Settings className="w-6 h-6" />
    </button>
    {children}
  </aside>
);

export default Sidebar; 