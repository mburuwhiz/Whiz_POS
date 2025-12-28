import React, { useState } from 'react';
import { usePosStore } from '../store/posStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCcw } from 'lucide-react';

const PreviousReceiptsPage: React.FC = () => {
  const transactions = usePosStore((state) => state.transactions);
  const reprintTransaction = usePosStore((state) => state.reprintTransaction);
  const currentCashier = usePosStore((state) => state.currentCashier);
  // Need to add logic to reverse transaction in store
  // Since reverseTransaction doesn't exist on the interface yet, I will need to implement it in store first.
  // But for now I can assume I will add it.
  // const reverseTransaction = usePosStore((state) => state.reverseTransaction);

  const navigate = useNavigate();
  const [isAdmin] = useState(currentCashier?.role === 'admin' || currentCashier?.role === 'manager');

  const handleReprint = (transactionId: string) => {
    reprintTransaction(transactionId);
  };

  const handleReverse = (transactionId: string) => {
      if (!isAdmin) {
          alert("Only Admins or Managers can reverse sales.");
          return;
      }
      if (confirm("Are you sure you want to reverse this sale? This will restore stock and remove the sales record.")) {
          // Trigger reverse action
          // reverseTransaction(transactionId);
          // Since the action is not in the store yet, I need to add it to posStore.ts first.
          // I will use a placeholder alert for now, and then update posStore.ts
          usePosStore.getState().reverseTransaction?.(transactionId);
      }
  };

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Previous Receipts</h1>
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Back
          </button>
        </div>
        <div className="overflow-x-auto">
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
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((tx) => (
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

                        {isAdmin && (
                            <button
                                onClick={() => handleReverse(tx.id)}
                                className="text-red-600 hover:text-red-800 flex items-center"
                                title="Reverse Sale"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Reverse
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviousReceiptsPage;
