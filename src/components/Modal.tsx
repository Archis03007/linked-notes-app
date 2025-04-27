import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, leftPanel, rightPanel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50" style={{ background: 'var(--main-bg)' }}>
      <div className="bg-zinc-900 text-zinc-100 p-0 w-screen h-screen flex flex-col relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-bold px-8 pt-6 pb-2 border-b border-zinc-800">{title}</h2>}
        <div className="flex flex-1 h-full">
          <aside className="w-48 min-w-[160px] border-r border-gray-800 flex flex-col p-6 gap-2" style={{ background: 'var(--left-panel-bg)' }}>
            {leftPanel}
          </aside>
          <section className="flex-1 p-8 overflow-y-auto">
            {rightPanel}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Modal; 