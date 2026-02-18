import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path is an admin route that needs protection
  if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
    const token = request.cookies.get('adminToken')?.value;
    const adminPassword = process.env.ADMIN_TOKEN;

    // If no token or invalid token, redirect to login
    if (!token || token !== adminPassword) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
