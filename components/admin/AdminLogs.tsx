'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';

export default function AdminLogs() {
  const { logs, logsPagination, loading, fetchLogs } = useAdminStore();
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs({ page: 1 });
  }, [fetchLogs]);

  const handlePageChange = (page: number) => {
    fetchLogs({ page });
  };

  const getActionIcon = (action: string) => {
    const icons: { [key: string]: string } = {
      balance_credit: '💰',
      balance_debit: '💸',
      account_freeze: '🧊',
      account_unfreeze: '🔓',
      transaction_approve: '✅',
      transaction_reject: '❌',
      game_pause: '⏸️',
      game_resume: '▶️',
      crash_set: '🎯',
      round_force_end: '🛑',
      user_login_as: '👤',
    };
    return icons[action] || '📝';
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      balance_credit: 'Balance Credited',
      balance_debit: 'Balance Debited',
      account_freeze: 'Account Frozen',
      account_unfreeze: 'Account Unfrozen',
      transaction_approve: 'Transaction Approved',
      transaction_reject: 'Transaction Rejected',
      game_pause: 'Game Paused',
      game_resume: 'Game Resumed',
      crash_set: 'Crash Point Set',
      round_force_end: 'Round Force Ended',
      user_login_as: 'Login As User',
    };
    return labels[action] || action.replace('_', ' ');
  };

  const getActionColor = (action: string) => {
    if (action.includes('approve') || action.includes('resume') || action.includes('unfreeze')) {
      return 'text-green-400';
    }
    if (action.includes('reject') || action.includes('pause') || action.includes('freeze') || action.includes('debit')) {
      return 'text-red-400';
    }
    if (action.includes('credit') || action.includes('set')) {
      return 'text-blue-400';
    }
    return 'text-gray-300';
  };

  const formatDetails = (action: string, details: any) => {
    const formatters: { [key: string]: (details: any) => string } = {
      balance_credit: (d) => `+${d.amount?.toLocaleString()} coins (${d.oldValue?.toLocaleString()} → ${d.newValue?.toLocaleString()})`,
      balance_debit: (d) => `-${d.amount?.toLocaleString()} coins (${d.oldValue?.toLocaleString()} → ${d.newValue?.toLocaleString()})`,
      account_freeze: (d) => `Status: ${d.oldValue} → ${d.newValue}`,
      account_unfreeze: (d) => `Status: ${d.oldValue} → ${d.newValue}`,
      transaction_approve: (d) => `Amount: ${d.amount?.toLocaleString()} coins`,
      transaction_reject: (d) => `Amount: ${d.amount?.toLocaleString()} coins`,
      crash_set: (d) => `Crash point set to ${d.newValue}x`,
      game_pause: () => 'Game engine paused',
      game_resume: () => 'Game engine resumed',
    };

    const formatter = formatters[action];
    if (formatter) {
      return formatter(details);
    }

    // Generic formatter
    if (details.amount) {
      return `Amount: ${details.amount.toLocaleString()}`;
    }
    if (details.newValue) {
      return `Value: ${details.newValue}`;
    }
    return '';
  };

  const actionTypes = [
    'balance_credit',
    'balance_debit',
    'account_freeze',
    'account_unfreeze',
    'transaction_approve',
    'transaction_reject',
    'game_pause',
    'game_resume',
    'crash_set',
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">📝 Admin Activity Logs</h2>
          <div className="flex space-x-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {getActionIcon(action)} {getActionLabel(action)}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchLogs({ page: 1, action: actionFilter })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
        <p className="text-gray-400">
          Complete audit trail of all administrative actions performed in the system.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Action</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Admin</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Target User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Details</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="py-4 px-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-40 animate-pulse"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getActionIcon(log.action)}</span>
                        <div>
                          <div className={`font-medium ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatDetails(log.action, log.details)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-white font-medium">{log.admin.email}</div>
                      {log.ipAddress && (
                        <div className="text-gray-400 text-xs font-mono">{log.ipAddress}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {log.targetUser ? (
                        <div className="text-white">{log.targetUser.email}</div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-md">
                        {log.details.reason && (
                          <div className="text-gray-300 text-sm mb-1">
                            <strong>Reason:</strong> {log.details.reason}
                          </div>
                        )}
                        {log.details.notes && (
                          <div className="text-gray-300 text-sm mb-1">
                            <strong>Notes:</strong> {log.details.notes}
                          </div>
                        )}
                        {log.details.oldValue !== undefined && log.details.newValue !== undefined && (
                          <div className="text-gray-400 text-xs">
                            {log.details.oldValue} → {log.details.newValue}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-400 text-sm">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No admin logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logsPagination.pages > 1 && (
          <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Page {logsPagination.current} of {logsPagination.pages} 
              ({logsPagination.total} total logs)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(logsPagination.current - 1)}
                disabled={logsPagination.current === 1}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(logsPagination.current + 1)}
                disabled={logsPagination.current === logsPagination.pages}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Summary */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🔍 Log Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-green-400 text-sm font-medium">Approvals</div>
            <div className="text-xl font-bold text-white">
              {logs.filter(log => log.action.includes('approve')).length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-red-400 text-sm font-medium">Rejections</div>
            <div className="text-xl font-bold text-white">
              {logs.filter(log => log.action.includes('reject')).length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-blue-400 text-sm font-medium">Balance Changes</div>
            <div className="text-xl font-bold text-white">
              {logs.filter(log => log.action.includes('balance')).length}
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-yellow-400 text-sm font-medium">Game Controls</div>
            <div className="text-xl font-bold text-white">
              {logs.filter(log => log.action.includes('game') || log.action.includes('crash')).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
