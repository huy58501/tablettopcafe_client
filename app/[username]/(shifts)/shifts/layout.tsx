import { redirect } from 'next/navigation';
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

  if (!auth || auth.role !== 'admin') {
    redirect('/404');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 w-full mt-2 overflow-x-hidden">{children}</main>
    </div>
  );
}
