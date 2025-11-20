import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { Wifi, WifiOff, CheckCircle, AlertCircle, RefreshCw, Database, Activity, Clock } from 'lucide-react';

interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'expense' | 'product' | 'customer';
  data: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
}

export default function OfflineSyncStatus() {
  const { syncQueue, isOnline } = usePosStore();
  const [syncHistory, setSyncHistory] = useState<SyncQueueItem[]>([]);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });

  // Load sync history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('whiz-pos-sync-history');
    if (savedHistory) {
      try {
        setSyncHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load sync history:', error);
      }
    }

    const savedLastSync = localStorage.getItem('whiz-pos-last-sync');
    if (savedLastSync) {
      setLastSyncTime(new Date(savedLastSync));
    }
  }, []);

  // Update sync stats
  useEffect(() => {
    const stats = {
      total: syncQueue.length,
      pending: syncQueue.filter(item => item.status === 'pending').length,
      completed: syncQueue.filter(item => item.status === 'completed').length,
      failed: syncQueue.filter(item => item.status === 'failed').length
    };
    setSyncStats(stats);
  }, [syncQueue]);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    
    try {
      // Simulate sync process
      for (const item of syncQueue) {
        if (item.status === 'pending') {
          // Update item status to syncing
          // In real app, this would sync with server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate success/failure
          const success = Math.random() > 0.2; // 80% success rate
          
          if (success) {
            item.status = 'completed';
            item.timestamp = new Date().toISOString();
          } else {
            item.status = 'failed';
            item.retryCount = (item.retryCount || 0) + 1;
          }
        }
      }
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('whiz-pos-last-sync', now.toISOString());
      
      // Add to sync history
      const newHistoryItem: SyncQueueItem = {
        id: Date.now().toString(),
        type: 'transaction',
        data: { items: syncQueue.length },
        timestamp: now.toISOString(),
        status: 'completed',
        retryCount: 0
      };
      
      const updatedHistory = [newHistoryItem, ...syncHistory.slice(0, 49)]; // Keep last 50
      setSyncHistory(updatedHistory);
      localStorage.setItem('whiz-pos-sync-history', JSON.stringify(updatedHistory));
      
      alert('Sync completed successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again later.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const clearSyncQueue = () => {
    if (confirm('Are you sure you want to clear all pending sync items? This cannot be undone.')) {
      // In real app, this would clear the sync queue
      localStorage.setItem('whiz-pos-sync-queue', JSON.stringify([]));
      window.location.reload();
    }
  };

  const retryFailedItems = () => {
    const failedItems = syncQueue.filter(item => item.status === 'failed');
    
    if (failedItems.length === 0) {
      alert('No failed items to retry');
      return;
    }
    
    // Reset failed items to pending
    const updatedQueue = syncQueue.map(item => 
      item.status === 'failed' ? { ...item, status: 'pending' as const } : item
    );
    
    localStorage.setItem('whiz-pos-sync-queue', JSON.stringify(updatedQueue));
    window.location.reload();
  };

  const getStatusIcon = (status: SyncQueueItem['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: SyncQueueItem['type']) => {
    switch (type) {
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'product': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionQuality = () => {
    // Simulate connection quality based on sync performance
    if (syncHistory.length === 0) return 'Unknown';
    
    const recentSyncs = syncHistory.slice(0, 5);
    const avgSuccessRate = recentSyncs.filter(s => s.status === 'completed').length / recentSyncs.length;
    
    if (avgSuccessRate >= 0.9) return 'Excellent';
    if (avgSuccessRate >= 0.7) return 'Good';
    if (avgSuccessRate >= 0.5) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sync Status</h1>
                <p className="text-gray-600">Offline data synchronization</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Connection Status</p>
                <p className="text-xl font-bold text-gray-800">{isOnline ? 'Connected' : 'Disconnected'}</p>
              </div>
              <div className={`p-3 rounded-full ${
                isOnline ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isOnline ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Connection Quality</p>
                <p className="text-xl font-bold text-gray-800">{getConnectionQuality()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Last Sync</p>
                <p className="text-xl font-bold text-gray-800">
                  {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{syncStats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{syncStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{syncStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">{syncStats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Sync Queue */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Sync Queue</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={retryFailedItems}
                  disabled={syncStats.failed === 0}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Retry Failed
                </button>
                <button
                  onClick={clearSyncQueue}
                  disabled={syncStats.total === 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.retryCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.status === 'failed' && (
                        <button
                          onClick={() => {
                            // Reset to pending for retry
                            const updatedQueue = syncQueue.map(q => 
                              q.id === item.id ? { ...q, status: 'pending' as const } : q
                            );
                            localStorage.setItem('whiz-pos-sync-queue', JSON.stringify(updatedQueue));
                            window.location.reload();
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {syncQueue.length === 0 && (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items in sync queue</p>
                <p className="text-sm text-gray-400">All data is synchronized</p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Sync Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Manual Sync Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing || syncStats.pending === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>{isManualSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Auto-sync:</span> Enabled when online
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Data automatically syncs every 5 minutes when connected
              </p>
            </div>
          </div>
        </div>

        {/* Sync History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Sync History</h2>
          </div>
          <div className="p-6">
            {syncHistory.length > 0 ? (
              <div className="space-y-3">
                {syncHistory.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{item.type} Sync</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {item.data.items ? `${item.data.items} items` : 'Completed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sync history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
