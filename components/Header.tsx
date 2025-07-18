'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import WalletModal from '@/components/WalletModalNew';

export default function Header() {
  const { user, logout } = useStore();
  const router = useRouter();
  const [walletModal, setWalletModal] = useState<{isOpen: boolean, mode: 'deposit' | 'withdraw'}>({
    isOpen: false,
    mode: 'deposit'
  });

  const openWallet = (mode: 'deposit' | 'withdraw') => {
    setWalletModal({ isOpen: true, mode });
  };

  const closeWallet = () => {
    setWalletModal({ isOpen: false, mode: 'deposit' });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-xl sm:text-2xl">✈️</div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Aviator</h1>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-1 sm:space-x-4">
                {/* Balance Display */}
                <div className="bg-gray-700/50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                  <div className="text-green-400 font-bold text-sm sm:text-lg">
                    💰 {(user.availableBalance ?? user.balance ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {user.reservedBalance && user.reservedBalance > 0 
                      ? `${user.reservedBalance.toLocaleString()} reserved`
                      : 'Available balance'
                    }
                  </div>
                </div>

                {/* Wallet Buttons */}
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => openWallet('deposit')}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    <span className="hidden sm:inline">💰 Deposit</span>
                    <span className="sm:hidden">💰</span>
                  </button>
                  <button
                    onClick={() => openWallet('withdraw')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    <span className="hidden sm:inline">💸 Withdraw</span>
                    <span className="sm:hidden">💸</span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModal.isOpen}
        onClose={closeWallet}
        mode={walletModal.mode}
      />
    </>
  );
}
