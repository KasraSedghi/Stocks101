'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { COLORS } from '@/config/design-tokens';
import { Button } from './Button';
import { Input } from './Input';
import { X, Send, Trash2 } from 'lucide-react';

export interface ChatTerminalProps {
  ticker?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatTerminal({ ticker, isOpen, onClose }: ChatTerminalProps) {
  const { messages, loading, usageCount, sendMessage, clearHistory } =
    useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await sendMessage(input, ticker);
    setInput('');
  };

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  const usageWarning = usageCount > 200 && usageCount < 250;
  const usageExceeded = usageCount >= 250;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-end md:items-center md:justify-end md:mr-4 md:mb-4">
        <div className="w-full md:w-96 h-full md:h-96 bg-dark-bg border-l-4 md:border md:rounded-lg md:border-brand-purple flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                AI Research Terminal
              </span>
              {!loading && !usageExceeded && (
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 hover:bg-dark-border rounded transition-colors text-gray-400 hover:text-gray-300"
                title="Clear history"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-dark-border rounded transition-colors text-gray-400 hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Usage Warning */}
          {usageWarning && (
            <div className="bg-yellow-900/20 border-b border-yellow-700/30 px-4 py-2 text-xs text-yellow-200">
              ⚠ {250 - usageCount} Agent Toolbelt calls remaining this month
            </div>
          )}

          {usageExceeded && (
            <div className="bg-red-900/20 border-b border-red-700/30 px-4 py-2 text-xs text-red-200">
              ⚠ Agent Toolbelt quota exceeded. Using fallback analysis.
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-mono text-sm">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-xs mb-2">No messages yet</p>
                  <p className="text-xs text-gray-600">
                    Ask about {ticker || 'a ticker'}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="bg-gray-700/40 rounded px-3 py-2 max-w-xs break-words text-gray-100">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-xs text-gray-300 whitespace-pre-wrap break-words">
                      {message.content.split('\n').map((line, idx) => {
                        // Bold markdown
                        const boldLine = line.replace(
                          /\*\*(.+?)\*\*/g,
                          (_, text) =>
                            `<span style="color: ${COLORS.brand.purple}; font-weight: bold;">${text}</span>`
                        );

                        // Links
                        const withLinks = boldLine.replace(
                          /https?:\/\/[^\s]+/g,
                          (url) =>
                            `<a href="${url}" target="_blank" rel="noopener" style="color: ${COLORS.brand.purple}; text-decoration: underline;">${url}</a>`
                        );

                        return (
                          <div
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: withLinks,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: COLORS.brand.purple,
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            className="border-t border-dark-border bg-dark-bg/80 backdrop-blur px-4 py-3"
          >
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={`Ask about ${ticker || 'a stock'}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || usageExceeded}
                className="flex-1 text-xs"
              />
              <Button
                type="submit"
                disabled={!input.trim() || loading || usageExceeded}
                size="sm"
                rightIcon={<Send size={14} />}
              >
                Send
              </Button>
            </div>
          </form>

          {/* Clear History Confirmation */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur rounded-lg md:rounded-lg flex items-center justify-center">
              <div className="bg-dark-panel border border-dark-border rounded p-4 max-w-xs">
                <p className="text-sm text-gray-300 mb-4">
                  Clear all chat history?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClear}
                    variant="danger"
                    size="sm"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close overlay */}
        <div
          className="absolute inset-0 md:hidden"
          onClick={onClose}
          style={{ zIndex: -1 }}
        />
      </div>
    </div>
  );
}
