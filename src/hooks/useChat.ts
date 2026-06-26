'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  lastTicker: string | null;
  sendMessage: (text: string, ticker?: string) => Promise<void>;
  clearHistory: () => void;
  usageCount: number;
}

const STORAGE_KEY_PREFIX = 'shadowvest_chat_';

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [lastTicker, setLastTicker] = useState<string | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored messages:', err);
      }
    }

    // Load usage count
    const usageKey = `${STORAGE_KEY_PREFIX}usage_${user.id}`;
    const storedUsage = localStorage.getItem(usageKey);
    if (storedUsage) {
      setUsageCount(parseInt(storedUsage, 10));
    }
  }, [user?.id]);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, user?.id]);

  const sendMessage = async (text: string, ticker?: string) => {
    if (!user || !text.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Update last ticker if provided
    if (ticker) {
      setLastTicker(ticker);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          ticker: ticker || lastTicker,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update usage count if provided
      if (data.usageCount !== undefined) {
        setUsageCount(data.usageCount);
        const usageKey = `${STORAGE_KEY_PREFIX}usage_${user.id}`;
        localStorage.setItem(usageKey, data.usageCount.toString());
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    if (user) {
      const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
      localStorage.removeItem(storageKey);
    }
  };

  return {
    messages,
    loading,
    lastTicker,
    sendMessage,
    clearHistory,
    usageCount,
  };
}
