'use client';

import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'sonner';
import client from '@/lib/apolloClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster
        richColors
        position="bottom-center"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </ApolloProvider>
  );
}
