'use client';
import { useEffect, useState } from 'react';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
     // In a real multi-tenant scenario, we'd fetch this from the super-admin database
     // For this mockup mapped to POS syncs, we'll display a generic static entry representing the connected POS instance
     setBusinesses([
         { id: 1, name: 'Main POS Instance', emailPrefix: 'main', status: 'Active', createdAt: new Date().toISOString() }
     ]);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Businesses Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Business</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Business Name</th>
              <th className="p-4 border-b">Email Prefix</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.length === 0 ? (
               <tr><td colSpan={4} className="p-8 text-center text-gray-500">No businesses found.</td></tr>
            ) : businesses.map((b) => (
                <tr key={b.id}>
                  <td className="p-4 border-b text-gray-900 font-medium">{b.name}</td>
                  <td className="p-4 border-b text-gray-600">{b.emailPrefix}</td>
                  <td className="p-4 border-b">
                     <span className={`px-2 py-1 text-xs rounded-full ${b.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {b.status}
                     </span>
                  </td>
                  <td className="p-4 border-b text-blue-600 cursor-pointer hover:underline">Edit</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
