import { API_ROUTES } from '@/config/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedUsername = url.searchParams.get('username');
  const cookie = request.headers.get('cookie');
  const apiKey = process.env.API_KEY;
  try {
    const response = await fetch(API_ROUTES.GET_USER_ME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie ?? '',
        'x-api-key': apiKey ?? '',
      },
      body: JSON.stringify({ username: requestedUsername }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
