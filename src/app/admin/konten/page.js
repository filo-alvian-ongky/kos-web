'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminKonten() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isAnimateReady, setIsAnimateReady] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSaving, setIsSaving] = useState(false);

  // State untuk menyimpan seluruh pengaturan web
  const [settings, setSettings] = useState({
    id: null,
    kosName: '',
    waNumber: '',
    heroTitle: '',
    heroSubtitle: '',
    address: '',
    mapsLink: ''
  });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => setIsAnimateReady(true), 100);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Mengambil data pengaturan dari database
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/konten');
      const data = await res.json();
      if (res.ok && data) {
        // Jika data ada, masukkan ke state
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      showToast("Gagal mengambil data pengaturan", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Menyimpan perubahan pengaturan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Pastikan nomor WA dimulai dengan 62 atau 0 untuk format standar
    let formattedWa = settings.waNumber.replace(/\D/g, ''); // Hapus karakter non-angka
    if (formattedWa.startsWith('0')) formattedWa = '62' + formattedWa.substring(1);
    
    const payload = { ...settings, waNumber: formattedWa };

    try {
      const res = await fetch('/api/konten', {
        method: 'POST', // Kita pakai POST untuk Upsert (Update if exists, Insert if not)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        setSettings(updatedData);
        showToast("Pengaturan Web berhasil disimpan!", "success");
      } else {
        showToast("Gagal menyimpan pengaturan.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // TAMPILAN SKELETON LOADING
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-12 transition-colors duration-300">
        <div className="px-4 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
          <div className="w-32 h-10 md:h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-12 max-w-7xl mx-auto space-y-3">
          <div className="w-48 md:w-80 h-10 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          <div className="w-64 md:w-96 h-5 md:h-6 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="px-4 md:px-10 max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"></div><div className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"></div></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-6"></div>
            <div className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
            <div className="w-full h-24 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN KONTEN ASLI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-32 md:pb-12 transition-colors duration-300 animate-fade-in relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl ${isAnimateReady ? 'transition-all duration-500 ease-out' : ''} ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-rose-600 text-white'}`}>
        <div className="bg-white/20 p-1 rounded-full">
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>
        <span className="font-bold text-sm md:text-base">{toast.message}</span>
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="px-4 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/admin/dashboard" draggable={false} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all duration-300 active:duration-75 active:scale-95 select-none bg-white dark:bg-gray-800 px-3 py-2 md:px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm md:text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg> Dashboard
        </Link>
        <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 active:duration-75 active:scale-90">
          {theme === 'light' ? <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
        </button>
      </div>

      <div className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-12 max-w-7xl mx-auto flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan Web</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg">Atur identitas, teks sambutan, dan kontak untuk halaman publik Anda.</p>
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PROFIL KOS */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></span>
              Profil Utama
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nama Kos</label>
                <input type="text" name="kosName" value={settings.kosName} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-colors text-sm md:text-base" placeholder="Contoh: KosKu Nyaman"/>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nomor WhatsApp (Admin)</label>
                <input type="text" name="waNumber" value={settings.waNumber} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-colors text-sm md:text-base" placeholder="Contoh: 081234567890"/>
                <p className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium">Nomor ini akan terhubung langsung dengan tombol "Pesan Sekarang" di halaman depan.</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEKS SAMBUTAN (HERO) */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></span>
              Teks Sambutan (Hero Section)
            </h2>
            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Judul Utama</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-bold transition-colors text-sm md:text-base" placeholder="Contoh: Temukan Kenyamanan Seperti di Rumah Sendiri"/>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Deskripsi Singkat</label>
                <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleInputChange} required rows="3" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none font-medium transition-colors text-sm md:text-base leading-relaxed" placeholder="Contoh: Kos modern dengan fasilitas lengkap, WiFi super cepat, dan lokasi strategis dekat kampus."></textarea>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOKASI */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm mb-10">
            <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span>
              Lokasi & Alamat
            </h2>
            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tautan Google Maps</label>
                <input type="text" name="mapsLink" value={settings.mapsLink} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium transition-colors text-sm md:text-base" placeholder="https://maps.google.com/..."/>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                <textarea name="address" value={settings.address} onChange={handleInputChange} required rows="2" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium transition-colors text-sm md:text-base leading-relaxed" placeholder="Contoh: Jl. Sudirman No. 123, Semarang..."></textarea>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON (Sticky on Mobile, Regular on Desktop) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 md:relative md:bg-transparent md:border-t-0 md:p-0 z-40">
            <div className="max-w-7xl mx-auto flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl md:rounded-full font-black text-white shadow-xl shadow-blue-500/30 transition-all duration-300 active:scale-95 flex justify-center items-center gap-2 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}