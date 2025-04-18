import { NextResponse } from 'next/server';
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.auth_token;
    const url = new URL(req.url);
    const requestedUsername = url.searchParams.get('username');

    if (!token) {
      return NextResponse.json({ authorized: false, error: 'Missing token' }, { status: 401 });
    }

    const decodedToken = jwt.decode(token);
    if (typeof decodedToken === 'string' || !decodedToken || !('username' in decodedToken)) {
      return NextResponse.json(
        { authorized: false, error: 'Invalid token structure' },
        { status: 401 }
      );
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ authorized: false, error: 'Missing JWT secret' }, { status: 500 });
    }

    const verifiedUser = jwt.verify(token, secretKey) as { username: string; role: string };

    const isAdmin = verifiedUser.role === 'admin';
    const isSelf = verifiedUser.username === requestedUsername;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ authorized: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      authorized: true,
      username: verifiedUser.username,
      role: verifiedUser.role,
    });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json(
      { authorized: false, error: 'Invalid token or server error' },
      { status: 401 }
    );
  }
}
