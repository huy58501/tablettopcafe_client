// lib/auth.ts
import { cookies } from 'next/headers';

export const checkAuthSSR = async (usernameFromPath: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/check-login-auth?username=${usernameFromPath}`,
    {
      method: 'POST',
      headers: {
        Cookie: `auth_token=${token}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data?.authorized ? data : null;
};
