import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Whiz POS Global Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block p-2 hover:bg-gray-800 rounded">Dashboard</Link>
          <Link href="/admin/businesses" className="block p-2 hover:bg-gray-800 rounded">Businesses</Link>
          <Link href="/admin/inquiries" className="block p-2 hover:bg-gray-800 rounded">Sales Inquiries</Link>
          <Link href="/admin/users" className="block p-2 hover:bg-gray-800 rounded">Global Admins</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
