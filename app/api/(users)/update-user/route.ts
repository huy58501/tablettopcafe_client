import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/api';

export async function POST(req: Request) {
  const { username, role, newRole, password, newPassword } = await req.json();
  console.log(username, role, newRole, password, newPassword);
  if (role === newRole && !password && !newPassword) {
    return NextResponse.json(
      { success: true, message: 'Role updated successfully' },
      { status: 200 }
    );
  }

  const cookie = req.headers.get('cookie');

  try {
    const response = await fetch(API_ROUTES.UPDATE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie ?? '',
        'x-api-key': process.env.API_KEY || '',
      },
      body: JSON.stringify({ username, role, newRole, password, newPassword }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error (CHANGE_PWD):', error);
    return NextResponse.json({ success: false, error: 'Failed to proxy request' }, { status: 500 });
  }
}
