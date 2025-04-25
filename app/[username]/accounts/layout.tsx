import { redirect } from 'next/navigation';
import { checkAuthSSR } from '@/lib/auth';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard',
};

// Define a type that matches Next.js's expectations
type LayoutProps = {
  children: ReactNode;
  params: Promise<{ username: string }> | { username: string };
};

export default async function Layout(props: LayoutProps) {
  // Handle both Promise and direct object cases
  const params = await Promise.resolve(props.params);
  const { username } = params;
  
  const auth = await checkAuthSSR(username);

  if (!auth || auth.role !== 'admin') {
    redirect('/404');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 mt-[73px] md:mt-0 w-full overflow-x-hidden">{props.children}</main>
    </div>
  );
}