import { API_ROUTES } from '@/config/api';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    });

    const data = await response.json();

    // If the server returned an error, pass it through with the appropriate status
    if (!response.ok || data.error) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
