import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Supprimer le cookie avec configuration pour production
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'lax' : 'lax',
    maxAge: 0,
    path: '/',
    ...(isProduction && { domain: '.moovelabs.com' }),
  });
  
  return response;
}









