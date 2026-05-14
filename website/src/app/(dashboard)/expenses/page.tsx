'use client';
import { useEffect, useState } from 'react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=expenses', {

    })
    .then(res => res.json())
    .then(data => {
        if (data.expenses) setExpenses(data.expenses);
        setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Expense</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Description</th>
              <th className="p-4 border-b">Category</th>
              <th className="p-4 border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading data...</td></tr>
             ) : expenses.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No data synced yet.</td></tr>
             ) : (
                expenses.map((e: any) => {
                    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data || e;
                    return (
                        <tr key={e.id}>
                            <td className="p-4 border-b text-gray-600">{data.timestamp ? new Date(data.timestamp).toLocaleDateString() : '-'}</td>
                            <td className="p-4 border-b font-medium text-gray-900">{data.description || '-'}</td>
                            <td className="p-4 border-b text-gray-600">{data.category || '-'}</td>
                            <td className="p-4 border-b text-gray-900 font-semibold">{data.amount || 0}</td>
                        </tr>
                    )
                })
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
