import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    if (path.startsWith('/jefe') && token?.role !== 'jefe_cuadrilla') {
      if (token?.role === 'auditor' || token?.role === 'super_admin') return NextResponse.redirect(new URL('/auditor', req.url));
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/auditor') && !['auditor', 'super_admin'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = { matcher: ['/jefe/:path*', '/auditor/:path*'] };
