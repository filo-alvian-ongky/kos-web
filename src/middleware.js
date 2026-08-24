import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. REDIRECT JIKA SUDAH LOGIN
  // Jika sudah punya token dan mencoba buka halaman login (/admin), lempar ke dashboard
  if (pathname === '/admin' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 2. PENGAMANAN HALAMAN ADMIN
  // Proteksi semua halaman di dalam /admin/... kecuali halaman login (/admin)
  if (pathname.startsWith('/admin/') && !token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 3. PENGAMANAN API ADMIN SENSITIF (Termasuk method GET)
  // Semua API khusus admin di bawah /api/admin/* wajib memiliki token
  if (pathname.startsWith('/api/admin') && !token) {
    return NextResponse.json(
      { error: 'Akses ditolak. Akses khusus admin.' },
      { status: 401 }
    );
  }

  // 4. PENGAMANAN API UMUM (POST, PUT, DELETE)
  // Mengunci perubahan database di API publik kecuali rute /api/auth
  if (pathname.startsWith('/api/')) {
    const method = request.method;
    if (['POST', 'PUT', 'DELETE'].includes(method) && !pathname.startsWith('/api/auth')) {
      if (!token) {
        return NextResponse.json(
          { error: 'Akses ditolak. Anda tidak memiliki izin.' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*'
  ],
};