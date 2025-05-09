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

  // Extract UserGreeting from children for mobile top bar
  let userGreeting = null;
  let restChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type && (child.type as any).name === 'UserGreeting') {
      userGreeting = child;
    } else {
      restChildren.push(child);
    }
  });

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
          fixed top-0 left-0 z-50 h-full w-64 bg-[var(--left-panel-bg)] text-gray-100 p-4 flex flex-col gap-4 border-r border-gray-800 shadow-xl transition-transform duration-200
          md:relative md:translate-x-0 md:flex md:min-h-screen md:max-h-screen md:sticky md:top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--left-panel-bg)' }}
      >
        {/* Mobile top bar: UserGreeting + settings/logout */}
        <div className="flex flex-row items-center justify-between mb-4 md:hidden gap-2">
          <div className="flex items-center font-semibold text-lg flex-1">{userGreeting}</div>
          <div className="flex items-center space-x-2">
            <button
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Settings"
              onClick={() => { closeSidebar(); router.push('/dashboard/settings'); }}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Desktop header with icons and greeting */}
        <div className="hidden md:flex md:flex-col md:w-full md:mb-4 gap-4">
          <div className="flex justify-between items-center">
            <button
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Settings"
              onClick={() => { closeSidebar(); router.push('/dashboard/settings'); }}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 px-2">{userGreeting}</div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {restChildren}
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 