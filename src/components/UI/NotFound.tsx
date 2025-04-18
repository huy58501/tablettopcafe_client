'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiHome } from 'react-icons/fi';

const NotFound: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You don't have permission to access this page. Please contact your administrator if you
            believe this is a mistake.
          </p>
        </div>

        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiHome className="w-5 h-5" />
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
