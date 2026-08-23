import { NextResponse } from 'next/server';

export function middleware(request) {
  // Mengambil nilai token dari cookies
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. PENGAMANAN HALAMAN UI ADMIN
  // ==========================================
  // Jika mencoba mengakses folder /admin/ (seperti /admin/dashboard atau /admin/kamar)
  // tapi bukan halaman login utama (/admin), dan tidak punya token:
  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin'; // Tendang kembali ke halaman login
      return NextResponse.redirect(url);
    }
  }

  // ==========================================
  // 2. PENGAMANAN JALUR BELAKANG (API ROUTE)
  // ==========================================
  if (pathname.startsWith('/api/')) {
    const method = request.method;
    
    // Metode POST, PUT, DELETE adalah metode untuk merubah database. 
    // Wajib diblokir jika tidak ada token!
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      
      // Pengecualian: Biarkan API Auth (Login/Logout) tetap bisa diakses tanpa token
      if (!pathname.startsWith('/api/auth') && !token) {
        return NextResponse.json(
          { error: 'Akses ditolak. Anda tidak memiliki izin Admin.' },
          { status: 401 }
        );
      }
    }
    
    // Metode GET dibiarkan lewat tanpa token, 
    // agar pengunjung website tetap bisa melihat daftar kamar dan konten di halaman utama.
  }

  // Jika lolos semua pemeriksaan, izinkan lewat
  return NextResponse.next();
}

// Menentukan rute mana saja yang akan dijaga oleh Middleware ini
export const config = {
  matcher: [
    '/admin/:path*', // Jaga semua halaman di dalam /admin
    '/api/:path*'    // Jaga semua jalur API
  ],
};