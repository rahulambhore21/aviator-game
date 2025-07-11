'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { userWalletAPI } from '@/lib/userAPI';

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  reference?: string;
  createdAt: string;
  adminNotes?: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'deposit' | 'withdraw';
}

export default function WalletModal({ isOpen, onClose, mode }: WalletModalProps) {
  const { user, setUser } = useStore();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'transaction' | 'history'>('transaction');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
      setAmount('');
      setPaymentMethod('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Listen for real-time transaction and balance updates
  useEffect(() => {
    const { socket } = useStore.getState();
    
    if (socket) {
      const handleTransactionUpdate = (transaction: Transaction) => {
        console.log('Transaction update received:', transaction);
        
        // Ensure transaction has required fields
        if (!transaction || !transaction._id) {
          console.error('Invalid transaction update received:', transaction);
          return;
        }
        
        setTransactions(prev => {
          // Update existing transaction or add new one
          const existingIndex = prev.findIndex(t => t._id === transaction._id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...transaction };
            return updated;
          } else {
            return [transaction, ...prev];
          }
        });
        
        // Show success message for approved transactions
        if (transaction.status === 'approved' && transaction.amount) {
          setSuccess(`${transaction.type} of ₹${transaction.amount.toLocaleString()} has been approved!`);
          setTimeout(() => setSuccess(''), 3000);
        }
      };

      const handleBalanceUpdate = (data: { userId: string; newBalance: number; availableBalance: number; reservedBalance: number }) => {
        console.log('Balance update received:', data);
        
        // Only update if this is for the current user
        if (user && data.userId === user.id) {
          setUser({
            ...user,
            balance: data.newBalance,
            availableBalance: data.availableBalance,
            reservedBalance: data.reservedBalance
          });
        }
      };

      socket.on('transaction-update', handleTransactionUpdate);
      socket.on('balance-update', handleBalanceUpdate);
      
      return () => {
        socket.off('transaction-update', handleTransactionUpdate);
        socket.off('balance-update', handleBalanceUpdate);
      };
    }
  }, [user, setUser]);

  const fetchTransactions = async () => {
    try {
      const response = await userWalletAPI.getHistory();
      setTransactions(response.transactions || []);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const availableBalance = user?.availableBalance ?? user?.balance ?? 0;
  const quickAmounts = mode === 'deposit' 
    ? [100, 500, 1000, 5000, 10000]
    : [100, 500, Math.floor(availableBalance / 2), availableBalance].filter(amt => amt > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const numAmount = parseFloat(amount);
    
    // Validation
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (mode === 'withdraw' && numAmount > availableBalance) {
      setError(`Insufficient available balance. You have ${availableBalance.toLocaleString()} coins available for withdrawal.`);
      setLoading(false);
      return;
    }

    try {
      if (mode === 'deposit') {
        await userWalletAPI.requestDeposit(numAmount, paymentMethod || 'credit_card');
        setSuccess(`Deposit request of ₹${numAmount.toLocaleString()} submitted! It will be reviewed by admin.`);
      } else {
        const response = await userWalletAPI.requestWithdrawal(numAmount, paymentMethod || 'bank_transfer');
        
        // Update user balance immediately to show reservation
        if (user && response.availableBalance !== undefined && response.reservedBalance !== undefined) {
          setUser({
            ...user,
            availableBalance: response.availableBalance,
            reservedBalance: response.reservedBalance
          });
        }
        
        setSuccess(`₹${numAmount.toLocaleString()} has been reserved for withdrawal! Awaiting admin approval.`);
      }
      
      setAmount('');
      setActiveTab('history');
      
      // Refresh transactions
      await fetchTransactions();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[95vh] overflow-y-auto border border-gray-700">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-gray-800 p-4 sm:p-6 border-b border-gray-700/50 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {mode === 'deposit' ? '💰 Deposit' : '💸 Withdraw'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6">

        {/* Tab Navigation */}
        <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('transaction')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'transaction' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400'
            }`}
          >
            {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400'
            }`}
          >
            History
          </button>
        </div>

        {/* Transaction Tab */}
        {activeTab === 'transaction' && (
          <>
            {/* Current Balance with Enhanced Display */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-green-400">
                {user?.balance?.toLocaleString() || 0} coins
              </div>
              
              {/* Show reserved amount prominently if exists */}
              {user?.reservedBalance && user.reservedBalance > 0 && (
                <div className="mt-2 p-2 bg-yellow-900/50 border border-yellow-600/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⏳</span>
                    <span className="text-sm text-yellow-300">
                      <strong>{user.reservedBalance.toLocaleString()} coins</strong> reserved for pending withdrawal
                    </span>
                  </div>
                  <div className="text-xs text-yellow-400 mt-1">
                    Available for betting/withdrawal: <strong>{(user.balance - user.reservedBalance).toLocaleString()} coins</strong>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Balance Information for Withdrawals */}
              {mode === 'withdraw' && (
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-400">💰</span>
                    <span className="text-sm font-medium text-blue-200">Balance Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Balance:</span>
                      <div className="text-white font-semibold">{user?.balance?.toLocaleString() || 0} coins</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Available for Withdrawal:</span>
                      <div className="text-green-400 font-semibold">{availableBalance.toLocaleString()} coins</div>
                    </div>
                    {user?.reservedBalance && user.reservedBalance > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-400">Reserved (Pending Withdrawals):</span>
                        <div className="text-yellow-400 font-semibold">{user.reservedBalance.toLocaleString()} coins</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Amount (coins)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={mode === 'withdraw' ? availableBalance : undefined}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Quick amounts:</div>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="py-2 px-3 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {quickAmount >= 1000 ? `${quickAmount/1000}k` : quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select method</option>
                  {mode === 'deposit' ? (
                    <>
                      <option value="credit_card">💳 Credit/Debit Card</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                      <option value="crypto">₿ Cryptocurrency</option>
                    </>
                  ) : (
                    <>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                      <option value="crypto">₿ Cryptocurrency</option>
                    </>
                  )}
                </select>
              </div>

              {/* Processing Notice */}
              <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                <div className="text-yellow-400 text-sm">
                  ⚠️ {mode === 'deposit' 
                    ? 'Deposits require admin approval and may take up to 24 hours to process.' 
                    : 'Withdrawals require admin approval and may take up to 24 hours to process.'
                  }
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  mode === 'deposit'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
                } text-white disabled:cursor-not-allowed`}
              >
                {loading 
                  ? 'Processing...' 
                  : `Submit ${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} Request`
                }
              </button>
            </form>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {transaction.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}
                        </span>
                        <span className="text-white font-bold">
                          {transaction.amount?.toLocaleString() || '0'} coins
                        </span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'approved' 
                          ? 'bg-green-600 text-white' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {transaction.status === 'pending' && '⏳ Pending'}
                        {transaction.status === 'approved' && '✅ Approved'}
                        {transaction.status === 'rejected' && '❌ Rejected'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'Unknown date'}
                    </div>
                    
                    {transaction.reference && (
                      <div className="text-sm text-gray-300 font-mono mt-1">
                        Reference: {transaction.reference}
                      </div>
                    )}
                    
                    {transaction.adminNotes && (
                      <div className="text-sm text-blue-300 mt-1">
                        Admin Notes: {transaction.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
