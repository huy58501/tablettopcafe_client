'use client';
import { use } from 'react';
import Sidebar from '@/components/UI/Sidebar';
import useAuth from '@/hooks/useAuth';
import LoadingModal from '@/components/UI/LoadingModal';
import NotFound from '@/components/UI/NotFound';
import { menuItemsClient, menuItemsAdmin } from '@/config/menuData';

type LayoutParams = {
  username: string;
};

export default function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { username } = use(params);
  const checkAuth = useAuth();

  if (checkAuth.authStatus === 'loading') return <LoadingModal />;
  if (checkAuth.authStatus === 'unauthorized' || !checkAuth.auth) return <NotFound />;

  const isAdmin = checkAuth.auth.role === 'admin';
  const isSelf = checkAuth.auth.username === username;

  if (!isAdmin && !isSelf) return <NotFound />;

  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar title="Admin Dashboard" menuItems={menuItemsAdmin(username)} />
        <main className="flex-1 mt-[73px] md:mt-0 w-full overflow-x-hidden">{children}</main>
      </div>
    );
  }

  // For client users
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar title="Client Dashboard" menuItems={menuItemsClient(username)} />
      <main className="flex-1 p-4 md:p-8 md:ml-6 mt-[73px] md:mt-0 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
