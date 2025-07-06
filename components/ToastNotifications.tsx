'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { gameState, currentBet } = useStore();

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (gameState.crashed && currentBet?.active) {
      addToast('💥 Game crashed! Better luck next time!', 'error');
    }
  }, [gameState.crashed, currentBet?.active]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 sm:top-24 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 max-w-xs ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
