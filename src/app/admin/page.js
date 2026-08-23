'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminAuth() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  // State untuk visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const router = useRouter();

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (isLoginMode) {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
          const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
          localStorage.setItem('adminName', formattedName);
          
          // Menggunakan window.location.href untuk mengatasi masalah stuck router.push
          window.location.href = '/admin/dashboard';
        } else {
          setErrorMsg(data.error || 'Username atau password salah!');
          setIsLoading(false);
        }
      } catch (err) {
        setErrorMsg('Terjadi kesalahan jaringan.');
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, secretCode })
        });

        const data = await res.json();

        if (res.ok) {
          setSuccessMsg('Akun berhasil dibuat! Silakan masuk.');
          setIsLoading(false);
          setPassword('');
          setSecretCode('');
          setTimeout(() => {
            setIsLoginMode(true);
            setSuccessMsg('');
          }, 1500);
        } else {
          setErrorMsg(data.error || 'Gagal melakukan registrasi.');
          setIsLoading(false);
        }
      } catch (err) {
        setErrorMsg('Terjadi kesalahan jaringan.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans flex flex-col justify-between p-6 transition-colors duration-300">
      
      {/* Top Bar */}
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
        <Link
          href="/"
          draggable={false}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all duration-300 active:scale-95 select-none bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm md:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          Kembali ke Beranda
        </Link>
        <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-90">
          {theme === 'light' ? (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          )}
        </button>
      </div>

      {/* Card Auth Utama */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-6 mx-auto shadow-inner">
            {isLoginMode ? '🔐' : '🛡️'}
          </div>

          <h1 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-2 tracking-tight">
            {isLoginMode ? 'Login Admin' : 'Daftar Admin'}
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm md:text-base">
            {isLoginMode ? 'Masuk untuk mengelola operasional Garuda Kostel' : 'Pendaftaran khusus dengan Kode Rahasia'}
          </p>

          {/* Toggle Tab Login / Register dengan Animasi Geser */}
          <div className="relative flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mb-6 overflow-hidden">
            
            {/* Pil Background Bergeser */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isLoginMode ? 'left-1' : 'left-1/2'
              }`}
            ></div>

            {/* Tombol Masuk */}
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors duration-300 ${
                isLoginMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Masuk
            </button>

            {/* Tombol Daftar Baru */}
            <button
              type="button"
              onClick={() => { setIsLoginMode(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors duration-300 ${
                !isLoginMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-2xl mb-5 text-sm font-bold text-center border border-rose-100 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl mb-5 text-sm font-bold text-center border border-emerald-100 dark:border-emerald-900/50">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text" required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base transition-colors"
                placeholder="Masukkan username"
              />
            </div>

            {/* Input Password dengan Vektor Mata SVG */}
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 pr-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none select-none p-1 transition-colors"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Input Kode Rahasia (Hanya saat mode Register) */}
            <div className={`transition-all duration-300 ease-in-out origin-top ${!isLoginMode ? 'opacity-100 max-h-32 mt-4' : 'opacity-0 max-h-0 m-0 overflow-hidden pointer-events-none'}`}>
              <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kode Rahasia Admin</label>
              <div className="relative">
                <input
                  type={showSecretCode ? 'text' : 'password'} required={!isLoginMode}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 pr-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base transition-colors"
                  placeholder="Masukkan kode rahasia"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none select-none p-1 transition-colors"
                  title={showSecretCode ? "Sembunyikan kode" : "Lihat kode"}
                >
                  {showSecretCode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 active:scale-95 text-base ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Memproses...' : (isLoginMode ? 'Masuk Dashboard' : 'Daftarkan Akun')}
              </button>
            </div>
          </form>

        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto text-center text-xs text-gray-400 dark:text-gray-600 font-medium">
        Garuda Kostel Management System &copy; 2026
      </div>

    </div>
  );
}