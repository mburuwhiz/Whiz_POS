'use client';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=users', {

    })
    .then(res => res.json())
    .then(data => {
        if (data.users) setUsers(data.users);
        setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users & Permissions</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add User</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Role</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading data...</td></tr>
             ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No data synced yet.</td></tr>
             ) : (
                users.map((u: any) => {
                    const data = typeof u.data === 'string' ? JSON.parse(u.data) : u.data || u;
                    return (
                        <tr key={u.id}>
                            <td className="p-4 border-b font-medium text-gray-900">{data.name || '-'}</td>
                            <td className="p-4 border-b text-gray-600 capitalize">{data.role || '-'}</td>
                            <td className="p-4 border-b">
                                <span className={`px-2 py-1 text-xs rounded-full ${data.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {data.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="p-4 border-b text-gray-500 text-sm">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-'}</td>
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
