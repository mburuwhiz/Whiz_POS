export default function GlobalAdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Global Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Businesses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Active Businesses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">10</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Transactions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,240</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display.</p>
      </div>
    </div>
  );
}
