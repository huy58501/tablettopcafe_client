'use client';

import { use } from 'react';
import NotFound from '@/components/UI/NotFound';
import LoadingModal from '@/components/UI/LoadingModal';
import useAuth from '@/hooks/useAuth';
import ShiftManager from '@/components/client/Shift/ShiftManager';

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

  return <ShiftManager />;
}
