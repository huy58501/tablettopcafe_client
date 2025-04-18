import { API_ROUTES } from '@/config/api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie');
  const apiKey = process.env.API_KEY;

  try {
    const response = await fetch(API_ROUTES.GET_USERS, {
      method: 'POST',
      headers: {
        Cookie: cookie ?? '',
        'x-api-key': apiKey ?? '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
