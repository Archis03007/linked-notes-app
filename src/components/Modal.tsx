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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg p-0 w-[60vw] h-[70vh] max-w-4xl max-h-[90vh] flex flex-col relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-bold px-8 pt-6 pb-2 border-b border-gray-800">{title}</h2>}
        <div className="flex flex-1 h-full">
          <aside className="w-48 min-w-[160px] border-r border-gray-800 bg-gray-950 flex flex-col p-6 gap-2">
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