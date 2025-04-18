import { NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/api';

export async function POST(req: Request) {
  try {
    console.log('🔵 Login attempt started');
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
    const API_BASE_URL = process.env.API_BASE_URL;

    console.log('🔵 API Configuration:', { API_BASE_URL, API_ROUTES: API_ROUTES.LOGIN });
    const { username, password, userAgent } = await req.json();
    console.log('🔵 Login attempt for user:', { username, userAgent, ip });
    const api_key = process.env.API_KEY;

    // Get current timestamp
    const loginTime = new Date().toISOString();

    // Validate the input data
    if (!username || !password) {
      console.log('🔴 Login failed: Missing credentials');
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    console.log('🔵 Sending login request to backend...');
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
        api_key,
      }),
    });

    // Handle non-OK response from backend
    if (!response.ok) {
      console.log('🔴 Backend response not OK:', response.status, response.statusText);
      throw new Error('Failed to login');
    }

    // Get the response data from PHP backend (which includes success/failure info)
    const data = await response.json();
    console.log('🔵 Backend response:', { success: data.success, message: data.message });
    
    // If login is successful, create JWT token
    if (data.success) {
      const token = data.token;
      console.log('🔵 Login successful, creating session...');

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

      console.log('🔵 Session created successfully');
      return nextResponse;
    }

    console.log('🔴 Login failed:', data.message);
    return NextResponse.json(
      { error: 'Invalid username or password', details: data.message },
      { status: 400 }
    );
  } catch (error) {
    console.log('🔴 Login error:', (error as Error).message);
    return NextResponse.json(
      { error: 'Failed to login', details: (error as Error).message },
      { status: 500 }
    );
  }
}
