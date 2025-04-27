import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { menuItemsClient, menuItemsAdmin } from '@/config/menuData';
import { checkAuthSSR } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard',
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const auth = await checkAuthSSR(username);

  if (!auth) redirect('/404');

  const isAdmin = auth.role === 'admin';
  const menuItems = isAdmin ? menuItemsAdmin(username) : menuItemsClient(username);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar title={isAdmin ? 'Admin Dashboard' : 'Client Dashboard'} menuItems={menuItems} />
      <main className="flex-1 mt-[30px] md:mt-0 w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
