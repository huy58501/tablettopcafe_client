import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/api';

export async function POST(req: Request) {
  try {
    let ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') || // Cloudflare support
      req.headers.get('fastly-client-ip') || // Fastly support
      req.headers.get('x-cluster-client-ip') ||
      req.headers.get('forwarded')?.split(';')[0].split('=')[1] ||
      'Unknown IP';
    // If running locally, override with a placeholder (useful for testing)
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = 'Localhost Testing IP';
    }
    const { username, password, userAgent } = await req.json();
    const api_key = process.env.API_KEY;

    // Get current timestamp
    const loginTime = new Date().toISOString();

    // Validate the input data
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const response = await fetch(API_ROUTES.LOGIN, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'x-api-key': api_key || '',
      }),
      body: JSON.stringify({
        username,
        password,
        ip,
        loginTime,
        userAgent,
      }),
    });

    // Handle non-OK response from backend
    if (!response.ok) {
      throw new Error('Failed to login');
    }

    // Get the response data from PHP backend (which includes success/failure info)
    const data = await response.json();

    // If login is successful, create JWT token
    if (data.success) {
      const token = data.token;

      // Create Next.js Response and set JWT token as HttpOnly cookie
      const nextResponse = NextResponse.json({
        success: true,
        message: data.message,
      });

      const expires = new Date(Date.now() + 28800 * 1000); // 8 hours

      nextResponse.cookies.set('auth_token', token, {
        httpOnly: true, // The cookie can't be accessed via JavaScript
        secure: process.env.NODE_ENV === 'production', // Make secure true in production
        path: '/', // Accessible on all paths
        sameSite: 'strict', // Helps prevent CSRF attacks
        expires, // Expiry time for the token (8 hours)
      });

      return nextResponse;
    }

    return NextResponse.json(
      { error: 'Invalid username or password', details: data.message },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to login', details: (error as Error).message },
      { status: 500 }
    );
  }
}
