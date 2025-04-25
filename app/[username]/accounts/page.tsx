'use client';

import AccountPage from '@/components/admin/account/AccountPage';

export default function AccountsPage() {
  return <AccountPage />;
}

// 'use client';

// import { use, useEffect } from 'react';
// import NotFound from '@/components/layout/NotFound';
// import LoadingModal from '@/components/UI/LoadingModal';
// import useAuth from '@/hooks/useAuth';
// import AccountPage from '@/components/admin/account/AccountPage';
// import { useRouter } from 'next/navigation';

// type PageParams = {
//   username: string;
// };

// export default function TableReservationsPage({ params }: { params: Promise<PageParams> }) {
//   const { username } = use(params);
//   const checkAuth = useAuth();
//   const router = useRouter();
//   const isAdmin = checkAuth.auth?.role === 'admin';
//   const isLoading = checkAuth.authStatus === 'loading';
//   const isUnauthorized = checkAuth.authStatus === 'unauthorized' || !checkAuth.auth;

//   useEffect(() => {
//     if (!isLoading && !isUnauthorized && !isAdmin) {
//       router.push(`/404`);
//     }
//   }, [isAdmin, isUnauthorized, isLoading, router, username]);

//   if (isLoading) return <LoadingModal />;
//   if (isUnauthorized) return <NotFound />;

//   return <AccountPage />;
// }
