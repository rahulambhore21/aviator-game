'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: string;
  paymentMethod?: string;
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Mock transactions data - replace with real API call
      setTransactions([
        {
          id: 'TXN-001',
          userId: '1',
          userEmail: 'user1@example.com',
          type: 'deposit',
          amount: 500,
          status: 'pending',
          timestamp: '2024-01-20 10:30:00',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'TXN-002',
          userId: '2',
          userEmail: 'user2@example.com',
          type: 'withdrawal',
          amount: 200,
          status: 'pending',
          timestamp: '2024-01-20 09:15:00'
        },
        {
          id: 'TXN-003',
          userId: '1',
          userEmail: 'user1@example.com',
          type: 'deposit',
          amount: 1000,
          status: 'completed',
          timestamp: '2024-01-19 14:22:00',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'TXN-004',
          userId: '3',
          userEmail: 'user3@example.com',
          type: 'withdrawal',
          amount: 150,
          status: 'rejected',
          timestamp: '2024-01-19 11:45:00'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleTransactionUpdate = async (transactionId: string, status: 'completed' | 'rejected') => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status } : t)
      );
      
      // In real app, make API call here:
      // await api.put(`/admin/transactions/${transactionId}`, { status });
      
    } catch (error) {
      console.error('Failed to update transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const completedTransactions = transactions.filter(t => t.status !== 'pending');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          🛠️ Admin Panel - Transaction Management
        </h1>

        {/* Pending Transactions - Priority Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">
              ⏳ Pending Transactions ({pendingTransactions.length})
            </h2>
            <button
              onClick={fetchTransactions}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-gray-300">No pending transactions</div>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date & Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {pendingTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-600/50">
                        <td className="px-4 py-3 text-white text-sm font-mono">
                          {transaction.id}
                        </td>
                        <td className="px-4 py-3 text-white">{transaction.userEmail}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              transaction.type === 'deposit' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {transaction.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white font-bold text-lg">
                          {transaction.amount.toLocaleString()} coins
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-sm">
                          {transaction.timestamp}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTransactionUpdate(transaction.id, 'completed')}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleTransactionUpdate(transaction.id, 'rejected')}
                              disabled={loading}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            📋 Transaction History ({completedTransactions.length})
          </h2>

          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {completedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-600/50">
                      <td className="px-4 py-3 text-white text-sm font-mono">
                        {transaction.id}
                      </td>
                      <td className="px-4 py-3 text-white">{transaction.userEmail}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {transaction.type === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdrawal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-bold">
                        {transaction.amount.toLocaleString()} coins
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {transaction.status === 'completed' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {transaction.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
