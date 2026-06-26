'use client';

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id }].slice(-4);
      return { toasts: newToasts };
    });

    if (toast.duration !== -1) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration ?? 5000);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function useToast() {
  const store = useToastStore();

  return {
    success: (message: string, duration?: number) =>
      store.addToast({ message, variant: 'success', duration }),
    error: (message: string, duration?: number) =>
      store.addToast({ message, variant: 'error', duration }),
    info: (message: string, duration?: number) =>
      store.addToast({ message, variant: 'info', duration }),
    warning: (message: string, duration?: number) =>
      store.addToast({ message, variant: 'warning', duration }),
  };
}
