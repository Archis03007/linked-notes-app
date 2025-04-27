import React from "react";
import { Settings, LogOut, Menu } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/utils/supabaseClient";

interface SidebarProps {
  children?: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ children, sidebarOpen, setSidebarOpen }) => {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-zinc-900 text-gray-100 shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-[var(--left-panel-bg)] text-gray-100 p-5 flex flex-col gap-5 border-r border-gray-800 shadow-xl transition-transform duration-200
          md:relative md:translate-x-0 md:flex md:min-h-screen md:max-h-screen md:sticky md:top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--left-panel-bg)' }}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <span className="text-xl font-bold">Menu</span>
          <button
            className="text-gray-400 hover:text-white"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        </div>
        {/* Settings and Logout always at the top on mobile, top-right on desktop */}
        <div className="flex space-x-3 mb-4 md:absolute md:top-5 md:right-5 md:mb-0">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Settings"
            onClick={() => { closeSidebar(); router.push('/dashboard/settings'); }}
          >
            <Settings className="w-6 h-6" />
          </button>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-5">{children}</div>
      </aside>
    </>
  );
};

export default Sidebar; 