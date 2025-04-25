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
  params: { username: string };
}) {
  const { username } = params;
  const auth = await checkAuthSSR(username);

  if (!auth || auth.role !== 'admin') {
    redirect('/404');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 mt-[73px] md:mt-0 w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
