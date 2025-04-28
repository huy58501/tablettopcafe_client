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
  // icon?: React.ElementType; // Uncomment if you want to add icons per menu item
}

const Sidebar: React.FC<NavbarProps> = ({ title, menuItems }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  // Add slide-in animation style to the document head if not present
  useEffect(() => {
    setHasMounted(true);
    if (!document.getElementById('sidebar-slide-in-style')) {
      const style = document.createElement('style');
      style.id = 'sidebar-slide-in-style';
      style.innerHTML = `@keyframes slide-in { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.4,0,0.2,1); }`;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <nav className="flex-1 flex flex-col gap-2">
      {menuItems.map(item => (
        <Link
          key={item.label}
          href={item.href}
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-indigo-600/30 hover:text-white transition-colors text-base font-medium"
        >
          {/* {item.icon && <item.icon className='w-5 h-5' />} */}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Header - At the top of the page */}
      <div className="md:hidden bg-slate-950 text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 hover:bg-slate-800/50 rounded-full transition-all duration-200 active:scale-95"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Fancy Mobile Menu Modal Overlay */}
      {hasMounted && (
        <div
          className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-slate-900/90 to-slate-800/80 shadow-2xl flex flex-col px-6 py-8 animate-slide-in">
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800/60 rounded-full text-white shadow-lg"
              aria-label="Close menu"
            >
              <FiX className="w-6 h-6" />
            </button>
            {/* Avatar/Branding */}
            <div className="flex flex-col items-center mb-8 mt-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white/20 mb-2">
                N
              </div>
              <span className="text-lg font-semibold text-white">{title}</span>
            </div>
            {/* Menu Items */}
            <SidebarContent />
            {/* Divider */}
            <div className="my-4 border-t border-slate-700/60" />
            {/* Logout at the bottom */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold shadow-lg w-full text-center justify-center mt-2"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-slate-950 text-white p-6 shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
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
