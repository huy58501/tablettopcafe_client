// app/api/logout/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const headers = new Headers();

  // Clear the 'auth_token' cookie
  headers.append('Set-Cookie', 'auth_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict');

  // Clear the 'username' cookie
  headers.append('Set-Cookie', 'username=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict');

  // Respond with success
  return NextResponse.json({ message: 'Logged out successfully' }, { headers });
}
