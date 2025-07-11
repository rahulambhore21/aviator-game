'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';

export default function UserManagement() {
  const {
    users,
    usersPagination,
    selectedUser,
    loading,
    fetchUsers,
    fetchUser,
    updateUserBalance,
    updateUserStatus,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Balance modal states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'credit' | 'debit'>('credit');
  const [balanceReason, setBalanceReason] = useState('');

  // Status modal states
  const [newStatus, setNewStatus] = useState<'active' | 'frozen' | 'suspended'>('active');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    fetchUsers({ page: 1, search: searchTerm, status: statusFilter });
  }, [fetchUsers, searchTerm, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ page: 1, search: searchTerm, status: statusFilter });
  };

  const handlePageChange = (page: number) => {
    fetchUsers({ page, search: searchTerm, status: statusFilter });
  };

  const openBalanceModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowBalanceModal(true);
    setBalanceAmount('');
    setBalanceAction('credit');
    setBalanceReason('');
  };

  const openStatusModal = (userId: string, currentStatus: string) => {
    setSelectedUserId(userId);
    setNewStatus(currentStatus as 'active' | 'frozen' | 'suspended');
    setShowStatusModal(true);
    setStatusReason('');
  };

  const handleBalanceUpdate = async () => {
    if (!balanceAmount || !balanceReason.trim()) return;
    
    await updateUserBalance(selectedUserId, parseFloat(balanceAmount), balanceAction, balanceReason);
    setShowBalanceModal(false);
  };

  const handleStatusUpdate = async () => {
    if (!statusReason.trim()) return;
    
    await updateUserStatus(selectedUserId, newStatus, statusReason);
    setShowStatusModal(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/50',
      frozen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      suspended: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Activity</th>
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
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-white font-medium">{user.email}</div>
                        <div className="text-gray-400 text-sm">
                          ID: {user._id.slice(-8)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white font-medium">{user.balance.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">
                        Bets: {user.totalBets} | Won: {user.totalWinnings.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded border text-sm font-medium ${getStatusBadge(user.accountStatus)}`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-400 text-sm">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBalanceModal(user._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Balance
                        </button>
                        <button
                          onClick={() => openStatusModal(user._id, user.accountStatus)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => fetchUser(user._id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersPagination.pages > 1 && (
          <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Page {usersPagination.current} of {usersPagination.pages} 
              ({usersPagination.total} total users)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(usersPagination.current - 1)}
                disabled={usersPagination.current === 1}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(usersPagination.current + 1)}
                disabled={usersPagination.current === usersPagination.pages}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Update User Balance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Action</label>
                <select
                  value={balanceAction}
                  onChange={(e) => setBalanceAction(e.target.value as 'credit' | 'debit')}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="credit">Credit (Add)</option>
                  <option value="debit">Debit (Subtract)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Reason</label>
                <textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Enter reason for balance adjustment..."
                  rows={3}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBalanceUpdate}
                disabled={!balanceAmount || !balanceReason.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
              >
                Update Balance
              </button>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Update User Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'active' | 'frozen' | 'suspended')}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="frozen">Frozen</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Reason</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  rows={3}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleStatusUpdate}
                disabled={!statusReason.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
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
