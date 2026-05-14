export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-2">Daily Closing Report</h3>
            <p className="text-gray-600 mb-4">View cashier totals, payment breakdowns, and items sold for any given day.</p>
            <button className="text-blue-600 font-semibold hover:underline">View Report &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-2">Monthly Summary</h3>
            <p className="text-gray-600 mb-4">Aggregated data including total sales, tax, and cashier totals.</p>
            <button className="text-blue-600 font-semibold hover:underline">View Report &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-2">Inventory Report</h3>
            <p className="text-gray-600 mb-4">Stock levels, low stock items, and total inventory value.</p>
            <button className="text-blue-600 font-semibold hover:underline">View Report &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-2">Tax Report</h3>
            <p className="text-gray-600 mb-4">Total tax collected per defined period.</p>
            <button className="text-blue-600 font-semibold hover:underline">View Report &rarr;</button>
        </div>
      </div>
    </div>
  );
}
