'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatTerminal } from './ChatTerminal';

/**
 * Floating AI-terminal launcher rendered app-wide via Layout.
 * Lets users ask research questions from any page (not just stock detail).
 * No ticker is bound here — the chat extracts the ticker from the question.
 */
export function GlobalChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI research terminal"
          title="Ask the AI research terminal"
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-brand-purple text-white shadow-lg shadow-brand-purple/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <MessageSquare size={24} />
        </button>
      )}

      <ChatTerminal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
