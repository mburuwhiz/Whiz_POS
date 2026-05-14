'use client';
import { useEffect, useState } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=credit_customers', {

    })
    .then(res => res.json())
    .then(data => {
        if (data.customers) setCustomers(data.customers);
        setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Credit Customers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Customer</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Phone</th>
              <th className="p-4 border-b">Total Credit</th>
              <th className="p-4 border-b">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading data...</td></tr>
             ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No data synced yet.</td></tr>
             ) : (
                customers.map((c: any) => {
                    const data = typeof c.data === 'string' ? JSON.parse(c.data) : c.data || c;
                    return (
                        <tr key={c.id}>
                            <td className="p-4 border-b font-medium text-gray-900">{data.name || '-'}</td>
                            <td className="p-4 border-b text-gray-600">{data.phone || '-'}</td>
                            <td className="p-4 border-b text-gray-900">{data.totalCredit || 0}</td>
                            <td className="p-4 border-b text-red-600 font-semibold">{data.balance || 0}</td>
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
