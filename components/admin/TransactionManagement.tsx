'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';

export default function TransactionManagement() {
  const {
    transactions,
    transactionsPagination,
    loading,
    fetchTransactions,
    processTransaction,
  } = useAdminStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTransactions({ page: 1, status: statusFilter, type: typeFilter });
  }, [fetchTransactions, statusFilter, typeFilter]);

  const handleFilter = () => {
    fetchTransactions({ page: 1, status: statusFilter, type: typeFilter });
  };

  const handlePageChange = (page: number) => {
    fetchTransactions({ page, status: statusFilter, type: typeFilter });
  };

  const openProcessModal = (transaction: any, actionType: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setAction(actionType);
    setShowProcessModal(true);
    setNotes('');
  };

  const handleProcess = async () => {
    if (!selectedTransaction || !notes.trim()) return;
    
    await processTransaction(selectedTransaction._id, action, notes);
    setShowProcessModal(false);
    setSelectedTransaction(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? '⬇️' : '⬆️';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Transaction Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-yellow-400 text-sm font-medium">Pending</div>
            <div className="text-xl font-bold text-white">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-green-400 text-sm font-medium">Approved</div>
            <div className="text-xl font-bold text-white">
              {transactions.filter(t => t.status === 'approved').length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-red-400 text-sm font-medium">Rejected</div>
            <div className="text-xl font-bold text-white">
              {transactions.filter(t => t.status === 'rejected').length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-blue-400 text-sm font-medium">Total Volume</div>
            <div className="text-xl font-bold text-white">
              {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User & Type</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="py-4 px-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                        <div>
                          <div className="text-white font-medium">{transaction.user.email || 'Unknown user'}</div>
                          <div className="text-gray-400 text-sm capitalize">
                            {transaction.type}
                          </div>
                          {transaction.reference && (
                            <div className="text-gray-500 text-xs font-mono">
                              {transaction.reference}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white font-medium text-lg">
                        {transaction.amount.toLocaleString()}
                      </div>
                      {transaction.paymentMethod && (
                        <div className="text-gray-400 text-sm">
                          {transaction.paymentMethod}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded border text-sm font-medium ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      {transaction.processedBy && (
                        <div className="text-gray-400 text-xs mt-1">
                          by {transaction.processedBy.email || 'Unknown user'}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-400 text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                      {transaction.processedAt && (
                        <div className="text-gray-500 text-xs">
                          Processed: {new Date(transaction.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {transaction.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openProcessModal(transaction, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openProcessModal(transaction, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Processed</span>
                          {transaction.adminNotes && (
                            <button
                              title={transaction.adminNotes}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              💬
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactionsPagination.pages > 1 && (
          <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Page {transactionsPagination.current} of {transactionsPagination.pages} 
              ({transactionsPagination.total} total transactions)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(transactionsPagination.current - 1)}
                disabled={transactionsPagination.current === 1}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(transactionsPagination.current + 1)}
                disabled={transactionsPagination.current === transactionsPagination.pages}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Transaction Modal */}
      {showProcessModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              {action === 'approve' ? 'Approve' : 'Reject'} Transaction
            </h3>
            
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getTypeIcon(selectedTransaction.type)}</span>
                <div>
                  <div className="text-white font-medium">{selectedTransaction.user.email|| 'Unknown user'}</div>
                  <div className="text-gray-400 text-sm capitalize">
                    {selectedTransaction.type} • {selectedTransaction.amount.toLocaleString()} coins
                  </div>
                </div>
              </div>
              {selectedTransaction.reference && (
                <div className="text-gray-500 text-xs font-mono">
                  Reference: {selectedTransaction.reference}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  {action === 'approve' ? 'Approval' : 'Rejection'} Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Enter reason for ${action}...`}
                  rows={3}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleProcess}
                disabled={!notes.trim()}
                className={`flex-1 ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors`}
              >
                {action === 'approve' ? 'Approve' : 'Reject'} Transaction
              </button>
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
