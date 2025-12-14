import React from 'react';
import Navigation from './Navigation';
import Header from './Header';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Navigation />
      <div className="flex-1 flex flex-col h-full">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
