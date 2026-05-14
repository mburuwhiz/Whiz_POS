export default function BusinessDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Business Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Today's Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">KES 45,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Weekly Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">KES 280,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Monthly Sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">KES 1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-500 text-sm">Stock Value</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">KES 3.5M</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">12</p>
        </div>
      </div>
    </div>
  );
}
