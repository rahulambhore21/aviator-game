'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import RecentCrashes from '@/components/RecentCrashes';

export default function LoginPage() {
  const { user } = useStore();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Redirect to game if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/game');
    }
  }, [user, router]);

  // Don't render anything if user is logged in (while redirecting)
  if (user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting to game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
    
      
      <div className="container mx-auto px-4 py-8">
        <AuthForm 
          mode={authMode} 
          onToggle={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
        />
      </div>
    </div>
  );
}
