'use client';

import { use, useEffect } from 'react';
import AdminDashboard from '@/components/admin/dashboard';
import NotFound from '@/components/UI/NotFound';
import LoadingModal from '@/components/UI/LoadingModal';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type PageParams = {
  username: string;
};

export default function DashboardPage({ params }: { params: Promise<PageParams> }) {
  const { username } = use(params);
  const checkAuth = useAuth();
  const router = useRouter();
  const isAdmin = checkAuth.auth?.role === 'admin';
  const isLoading = checkAuth.authStatus === 'loading';
  const isUnauthorized = checkAuth.authStatus === 'unauthorized' || !checkAuth.auth;

  useEffect(() => {
    if (!isLoading && !isUnauthorized && !isAdmin) {
      router.push(`/404`);
    }
  }, [isAdmin, isUnauthorized, isLoading, router, username]);

  if (isLoading) return <LoadingModal />;
  if (isUnauthorized) return <NotFound />;

  return <AdminDashboard />;

  // If admin is viewing their own dashboard
  // if (isAdmin && isSelf) {
  //   return <AdminDashboard />;
  // }

  // For clients or when admin is viewing a client's dashboard
  // return <TableReservations />;
}
