import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/api';

export async function POST(req: Request) {
  const { username, password, role, fullName, email, phone, position, address } = await req.json();
  const cookie = req.headers.get('cookie');

  try {
    const response = await fetch(API_ROUTES.CREATE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie ?? '',
        'x-api-key': process.env.API_KEY || '',
      },
      body: JSON.stringify({ username, password, role, fullName, email, phone, position, address }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error (CREATE_USER):', error);
    return NextResponse.json({ success: false, error: 'Failed to proxy request' }, { status: 500 });
  }
}
