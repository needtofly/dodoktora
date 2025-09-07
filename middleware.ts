// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  // pozwól na stronę logowania
  if (isAdminPage && pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // sprawdź cookie
  const auth = req.cookies.get('admin')?.value === '1';

  if (isAdminPage) {
    if (auth) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    // zapamiętaj dokąd wrócić po zalogowaniu
    if (pathname !== '/admin') url.searchParams.set('next', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  if (isAdminApi) {
    if (auth) return NextResponse.next();
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
