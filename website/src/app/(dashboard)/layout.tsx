import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Business Portal</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Dashboard</Link>
          <Link href="/transactions" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Transactions</Link>
          <Link href="/inventory" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Inventory</Link>
          <Link href="/users" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Users & Perms</Link>
          <Link href="/customers" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Credit Customers</Link>
          <Link href="/expenses" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Expenses</Link>
          <Link href="/reports" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Reports</Link>
          <Link href="/settings" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
