'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { walletAPI } from '@/lib/api';

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
  const { user } = useStore();
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

  const fetchTransactions = async () => {
    try {
      const response = await walletAPI.getHistory();
      setTransactions(response.transactions || []);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const quickAmounts = mode === 'deposit' 
    ? [100, 500, 1000, 5000, 10000]
    : [100, 500, Math.floor((user?.balance || 0) / 2), user?.balance || 0].filter(amt => amt > 0);

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

    if (mode === 'withdraw' && numAmount > (user?.balance || 0)) {
      setError('Insufficient balance');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new transaction
      const newTransaction: Transaction = {
        _id: 'TXN-' + Date.now(),
        type: mode === 'withdraw' ? 'withdrawal' : 'deposit',
        amount: numAmount,
        status: 'pending',
        createdAt: new Date().toLocaleString()
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      setSuccess(`${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted! It will be reviewed by admin.`);
      setAmount('');
      setActiveTab('history');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'deposit' ? '💰 Deposit' : '💸 Withdraw'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

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
            {/* Current Balance */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-green-400">
                {user?.balance?.toLocaleString() || 0} coins
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  max={mode === 'withdraw' ? user?.balance : undefined}
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

              {/* Payment Method (for deposits) */}
              {mode === 'deposit' && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Payment Method</div>
                  <div className="flex items-center space-x-2 text-white">
                    <span>💳</span>
                    <span>Credit/Debit Card</span>
                  </div>
                </div>
              )}

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
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                      {transaction.createdAt}
                    </div>
                    
                    <div className="text-sm text-gray-300 font-mono mt-1">
                      ID: {transaction._id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}