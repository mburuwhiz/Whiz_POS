'use client';
import { useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/data?table=transactions', {
      headers: {
        'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_API_AUTH_KEY || 'your-api-key-here')
      }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
    })
    .then(data => {
        if (data.transactions) setTransactions(data.transactions);
        setLoading(false);
    })
    .catch(err => {
        console.error(err);
        setError('Error loading transactions. Check API Key.');
        setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transactions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && <div className="p-4 bg-red-50 text-red-600">{error}</div>}
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Date & Time</th>
              <th className="p-4 border-b">Cashier</th>
              <th className="p-4 border-b">Total</th>
              <th className="p-4 border-b">Method</th>
              <th className="p-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading data...</td></tr>
            ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No data synced yet.</td></tr>
            ) : (
                transactions.map((t: any) => {
                    const data = typeof t.data === 'string' ? JSON.parse(t.data) : t.data || t;
                    return (
                        <tr key={t.id}>
                            <td className="p-4 border-b text-gray-900">{data.id || t.id}</td>
                            <td className="p-4 border-b text-gray-600">{data.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}</td>
                            <td className="p-4 border-b text-gray-900">{data.cashier || '-'}</td>
                            <td className="p-4 border-b font-medium text-gray-900">{data.total}</td>
                            <td className="p-4 border-b text-gray-600 uppercase text-xs tracking-wider">{data.paymentMethod}</td>
                            <td className="p-4 border-b">
                                <span className={`px-2 py-1 text-xs rounded-full ${data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {data.status}
                                </span>
                            </td>
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
