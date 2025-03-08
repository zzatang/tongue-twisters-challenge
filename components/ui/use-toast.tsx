'use client';

import React from 'react';
import { useState, useEffect } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState extends ToastProps {
  id: string;
  visible: boolean;
}

// Global state for toasts
let toasts: ToastState[] = [];
let listeners: ((toasts: ToastState[]) => void)[] = [];

const addToast = (toast: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastState = {
    ...toast,
    id,
    visible: true,
    variant: toast.variant || 'default',
    duration: toast.duration || 5000,
  };
  
  toasts = [...toasts, newToast];
  listeners.forEach(listener => listener(toasts));
  
  // Auto dismiss
  setTimeout(() => {
    dismissToast(id);
  }, newToast.duration);
  
  return id;
};

const dismissToast = (id: string) => {
  // First set visible to false for animation
  toasts = toasts.map(t => 
    t.id === id ? { ...t, visible: false } : t
  );
  listeners.forEach(listener => listener(toasts));
  
  // Then remove after animation completes
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toasts));
  }, 300);
};

export function useToast() {
  const [localToasts, setLocalToasts] = useState<ToastState[]>(toasts);
  
  useEffect(() => {
    const listener = (updatedToasts: ToastState[]) => {
      setLocalToasts([...updatedToasts]);
    };
    
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toasts: localToasts,
    toast: addToast,
    dismiss: dismissToast,
  };
}

export function toast(props: ToastProps) {
  return addToast(props);
}

// Toast component
export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            transform transition-all duration-300 ease-in-out
            ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
            max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden
            ${toast.variant === 'destructive' ? 'border-l-4 border-red-500' : ''}
            ${toast.variant === 'success' ? 'border-l-4 border-green-500' : ''}
          `}
          role="alert"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  {toast.title}
                </h3>
                {toast.description && (
                  <div className="mt-1 text-sm text-gray-500">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
