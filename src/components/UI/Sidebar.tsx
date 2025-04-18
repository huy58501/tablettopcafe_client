'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface NavbarProps {
  title: string;
  menuItems: MenuItem[];
}

interface MenuItem {
  label: string;
  href: string;
}

const Sidebar: React.FC<NavbarProps> = ({ title, menuItems }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState('');

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const SidebarContent = () => (
    <nav className="space-y-2">
      {menuItems.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>{item.label}</span>
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors w-full text-left cursor-pointer"
      >
        <FiLogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-950 text-white px-6 py-5 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 hover:bg-slate-800/50 rounded-full transition-all duration-200 active:scale-95"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-slate-950/95 backdrop-blur-sm transition-all duration-300 z-40 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full pointer-events-none'
        }`}
        style={{ top: '73px' }}
      >
        <div className="p-6">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-slate-950 text-white p-6 shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <SidebarContent />
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  );
};

export default Sidebar;
