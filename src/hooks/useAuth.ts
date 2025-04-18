import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthResponse = {
  authorized: boolean;
  username: string;
  role: 'admin' | 'client' | 'tester';
};

const useAuth = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>(
    'loading'
  );
  const router = useRouter();
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const usernameFromPath = window.location.pathname.split('/')[1];
      if (usernameFromPath) {
        try {
          const response = await fetch(`/api/auth/check-login-auth?username=${usernameFromPath}`, {
            method: 'POST',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            if (data.authorized) {
              setAuthStatus('authorized');
              setAuth(data);
            } else {
              setAuthStatus('unauthorized');
              setAuth(null);
            }
          } else {
            setAuthStatus('unauthorized');
            setAuth(null);
          }
        } catch (error) {
          console.error('Error during authentication check:', error);
          setAuthStatus('unauthorized');
          router.push('/404');
        }
      } else {
        console.warn('Username mismatch or missing, redirecting to login.');
        setAuthStatus('unauthorized');
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  return { authStatus, auth, loading };
};

export default useAuth;
