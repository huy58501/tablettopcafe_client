'use client';

import { use } from 'react';
import NotFound from '@/components/layout/NotFound';
import LoadingModal from '@/components/UI/LoadingModal';
import useAuth from '@/hooks/useAuth';
import Tables from '@/components/client/tables/Tables';
type PageParams = {
  username: string;
};

export default function TablesPage({ params }: { params: Promise<PageParams> }) {
  const { username } = use(params);
  const checkAuth = useAuth();

  if (checkAuth.authStatus === 'loading') return <LoadingModal />;
  if (checkAuth.authStatus === 'unauthorized' || !checkAuth.auth) return <NotFound />;

  const isAdmin = checkAuth.auth.role === 'admin';
  const isSelf = checkAuth.auth.username === username;

  if (!isAdmin && !isSelf) return <NotFound />;

  return <Tables />;
}
