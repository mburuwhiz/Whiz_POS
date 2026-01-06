import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCcw, Search, Calendar, AlertTriangle, X } from 'lucide-react';

const PreviousReceiptsPage: React.FC = () => {
  const transactions = usePosStore((state) => state.transactions);
  const reprintTransaction = usePosStore((state) => state.reprintTransaction);
  const deleteTransactions = usePosStore((state) => state.deleteTransactions);
  const currentCashier = usePosStore((state) => state.currentCashier);

  const navigate = useNavigate();
  const isAdminOrManager = currentCashier?.role === 'admin' || currentCashier?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleReprint = (transactionId: string) => {
    reprintTransaction(transactionId);
  };

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredTransactions = sortedTransactions.filter(tx =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const transactionIds = [...new Set(transactions.map(t => t.id))];

  const handleDeleteReceipts = () => {
    if (!dateRange.start || !dateRange.end) {
        alert("Please select a valid date range.");
        return;
    }

    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    const todayStr = new Date().toLocaleDateString('en-CA');

    const idsToDelete = transactions.filter(tx => {
        const txDate = new Date(tx.timestamp);
        const txDateStr = txDate.toLocaleDateString('en-CA');

        // Check range
        if (txDate < start || txDate > end) return false;

        // Strict: Check if today
        if (txDateStr === todayStr) return false;

        return true;
    }).map(tx => tx.id);

    if (idsToDelete.length === 0) {
        alert("No eligible receipts found to delete. Note: Today's receipts cannot be deleted.");
        return;
    }

    if (confirm(`Found ${idsToDelete.length} receipts to delete. This cannot be undone. Proceed?`)) {
        deleteTransactions(idsToDelete);
        setShowDeleteModal(false);
        // Optional: Add log or visual feedback
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Previous Receipts</h1>
            <p className="text-sm text-gray-500">View and manage transaction history</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search Receipt No..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    list="receipt-ids"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <datalist id="receipt-ids">
                    {transactionIds.slice(0, 100).map(id => <option key={id} value={id} />)}
                </datalist>
             </div>

             {isAdminOrManager && (
                 <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                 >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden md:inline">Delete Old</span>
                 </button>
             )}

             <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
             >
                Back
             </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Receipt ID</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Cashier</th>
                <th scope="col" className="px-6 py-3">Items</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">{tx.cashier}</td>
                    <td className="px-6 py-4">{tx.items.length} items</td>
                    <td className="px-6 py-4 font-bold text-gray-800">Ksh. {tx.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                            onClick={() => handleReprint(tx.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            title="Reprint Receipt"
                        >
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            Reprint
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Receipt Not Found</h3>
                        <p className="max-w-xs mx-auto text-center">
                            The receipt number you entered either doesn't exist or has been deleted.
                            Please check the number and try again.
                        </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Receipts Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
                      <div className="bg-red-100 p-2 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900">Delete Old Receipts</h3>
                          <p className="text-red-700 text-sm mt-1">
                              Select a date range to permanently delete transaction records.
                          </p>
                      </div>
                      <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="p-6 space-y-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                          <strong>Note:</strong> Receipts generated today ({new Date().toLocaleDateString()}) cannot be deleted to ensure daily reporting integrity.
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                              <div className="relative">
                                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                      type="date"
                                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                      value={dateRange.start}
                                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <div className="relative">
                                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                      type="date"
                                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                      value={dateRange.end}
                                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                      <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={handleDeleteReceipts}
                          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                      >
                          <Trash2 className="w-4 h-4" />
                          Delete Receipts
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PreviousReceiptsPage;
