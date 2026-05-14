'use client';
import { useEffect, useState } from 'react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=products', {

    })
    .then(res => res.json())
    .then(data => {
        if (data.products) setProducts(data.products);
        setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Product</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Product Name</th>
              <th className="p-4 border-b">Category</th>
              <th className="p-4 border-b">Price</th>
              <th className="p-4 border-b">Current Stock</th>
              <th className="p-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
             {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading data...</td></tr>
             ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No data synced yet.</td></tr>
             ) : (
                products.map((p: any) => {
                    const data = typeof p.data === 'string' ? JSON.parse(p.data) : p.data || p;
                    return (
                        <tr key={p.id}>
                            <td className="p-4 border-b font-medium text-gray-900">{data.name || '-'}</td>
                            <td className="p-4 border-b text-gray-600">{data.category || '-'}</td>
                            <td className="p-4 border-b text-gray-900">{data.price}</td>
                            <td className="p-4 border-b text-gray-900">{data.stock !== undefined ? data.stock : '-'}</td>
                            <td className="p-4 border-b">
                                <span className={`px-2 py-1 text-xs rounded-full ${data.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {data.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </td>
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
