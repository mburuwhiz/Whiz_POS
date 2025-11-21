import React, { useState } from 'react';
import Navigation from './Navigation';
import Header from './Header';
import { Menu } from 'lucide-react';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Navigation onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center bg-white shadow-sm p-4 lg:p-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:hidden font-bold text-xl text-gray-800">WHIZ POS</div>
          <div className="hidden lg:block flex-1">
             <Header />
          </div>
          <div className="lg:hidden">
             {/* Mobile Header Content if needed */}
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
