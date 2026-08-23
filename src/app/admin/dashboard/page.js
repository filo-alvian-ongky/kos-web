'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  const [greeting, setGreeting] = useState('Selamat datang');
  const [adminName, setAdminName] = useState('Filo');

  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // Logika Waktu Real-time
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 11) {
      setGreeting('Selamat pagi');
    } else if (currentHour >= 11 && currentHour < 15) {
      setGreeting('Selamat siang');
    } else if (currentHour >= 15 && currentHour < 18) {
      setGreeting('Selamat sore');
    } else {
      setGreeting('Selamat malam');
    }

    // Mengambil nama dari localStorage, jika tidak ada, gunakan "Filo"
    const savedUser = localStorage.getItem('adminName');
    if (savedUser) {
      setAdminName(savedUser);
    } else {
      localStorage.setItem('adminName', 'Filo');
    }

    const fetchDashboardStats = async () => {
      try {
        const [resRooms, resBookings] = await Promise.all([
          fetch('/api/kamar'),
          fetch('/api/booking')
        ]);
        const roomsData = await resRooms.json();
        const bookingsData = await resBookings.json();

        if (Array.isArray(roomsData) && Array.isArray(bookingsData)) {
          const availableCount = roomsData.filter(r => r.status === 'Available').length;
          setStats({
            totalRooms: roomsData.length,
            availableRooms: availableCount,
            totalBookings: bookingsData.length,
          });
        }
      } catch (error) {
        console.error("Gagal memuat statistik dashboard:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchDashboardStats();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('adminName'); // Bersihkan nama saat logout
    router.push('/admin'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-12 transition-colors duration-300">
        <div className="px-6 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
          <div className="w-32 md:w-36 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="w-28 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
        </div>

        <div className="pt-10 pb-8 px-6 md:px-12 max-w-7xl mx-auto space-y-4">
          <div className="w-64 md:w-80 h-10 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          <div className="w-full md:w-2/3 h-5 md:h-6 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>

        <div className="px-4 md:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse mb-6"></div>
                <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4"></div>
                <div className="space-y-2.5 mt-2">
                  <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-12 transition-colors duration-300 animate-fade-in">
      
      <div className="px-6 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          target="_blank" 
          draggable={false}
          className="flex items-center gap-2 select-none text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all duration-300 active:duration-75 active:scale-95 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
          <span className="hidden md:block">Lihat Situs</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 active:duration-75 active:scale-90">
            {theme === 'light' ? (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold px-4 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-800 dark:hover:text-rose-100 transition-all duration-300 active:duration-75 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="hidden md:block">Keluar</span>
          </button>
        </div>
      </div>

      <div className="pt-10 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Beranda Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {greeting}, {adminName}! Pilih menu di bawah untuk mengelola operasional Garuda Kostel.
        </p>
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          
          <Link href="/admin/kamar" draggable={false} className="block select-none p-6 md:p-8 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:-translate-y-1 active:scale-95 active:bg-blue-50/50 dark:active:bg-gray-700/80 transition-all duration-300 active:duration-75 group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </div>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full">
                  {stats.availableRooms} Tersedia
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Kelola Kamar</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">Ubah harga, perbarui foto, dan atur status ketersediaan kamar agar denah selalu akurat.</p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs font-bold text-gray-400 flex justify-between items-center">
              <span>Total Unit Terdaftar</span>
              <span className="text-gray-800 dark:text-gray-200 font-black text-base">{stats.totalRooms} Kamar</span>
            </div>
          </Link>

          <Link href="/admin/booking" draggable={false} className="block select-none p-6 md:p-8 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200 dark:hover:border-green-500/30 hover:-translate-y-1 active:scale-95 active:bg-green-50/50 dark:active:bg-gray-700/80 transition-all duration-300 active:duration-75 group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-full">
                  Aktif
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data Penyewa</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">Catat penyewa baru, cek tanggal jatuh tempo, dan unduh laporan transaksi dalam format CSV.</p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs font-bold text-gray-400 flex justify-between items-center">
              <span>Total Riwayat Pesanan</span>
              <span className="text-gray-800 dark:text-gray-200 font-black text-base">{stats.totalBookings} Pesanan</span>
            </div>
          </Link>

          <Link href="/admin/konten" draggable={false} className="block select-none p-6 md:p-8 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-500/30 hover:-translate-y-1 active:scale-95 active:bg-purple-50/50 dark:active:bg-gray-700/80 transition-all duration-300 active:duration-75 group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black rounded-full">
                  Sistem
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pengaturan Web</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">Ubah teks sambutan, sesuaikan alamat, dan perbarui nomor WhatsApp kontak utama kos Anda.</p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 text-xs font-bold text-gray-400 flex justify-between items-center">
              <span>Status Situs</span>
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Online
              </span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}