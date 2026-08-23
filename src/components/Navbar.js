'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ theme, toggleTheme }) {
  const pathname = usePathname();
  const [kosName, setKosName] = useState('Garuda Kostel');

  // Refs & States untuk Pil Animasi (Native DOM Measurement)
  const desktopRefs = useRef([]);
  const mobileRefs = useRef([]);
  const [desktopPill, setDesktopPill] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [mobilePill, setMobilePill] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });

  useEffect(() => {
    const cachedName = localStorage.getItem('savedKosName');
    if (cachedName) setKosName(cachedName);

    fetch('/api/konten')
      .then(res => res.json())
      .then(data => {
        const d = Array.isArray(data) ? data[0] : data;
        if (d?.kosName && d.kosName !== cachedName) {
          setKosName(d.kosName);
          localStorage.setItem('savedKosName', d.kosName);
        }
      })
      .catch(err => console.error("Gagal memuat navbar:", err));
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { name: 'Kamar', path: '/kamar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10" /> },
    { name: 'Fasilitas', path: '/fasilitas', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /> },
    { name: 'Lokasi', path: '/lokasi', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /> },
  ];

  // Logika Kalkulasi Posisi Pil Anti-Glitch
  useEffect(() => {
    const updatePill = () => {
      const activeIndex = navLinks.findIndex(link => link.path === pathname);
      
      if (activeIndex !== -1) {
        // Hitung Pil Desktop
        const dEl = desktopRefs.current[activeIndex];
        if (dEl) {
          setDesktopPill({ left: dEl.offsetLeft, top: dEl.offsetTop, width: dEl.offsetWidth, height: dEl.offsetHeight, opacity: 1 });
        }
        // Hitung Pil Mobile
        const mEl = mobileRefs.current[activeIndex];
        if (mEl) {
          setMobilePill({ left: mEl.offsetLeft, top: mEl.offsetTop, width: mEl.offsetWidth, height: mEl.offsetHeight, opacity: 1 });
        }
      } else {
        setDesktopPill(prev => ({ ...prev, opacity: 0 }));
        setMobilePill(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Delay 50ms untuk memastikan elemen DOM sudah ter-render sempurna
    const timer = setTimeout(updatePill, 50);
    window.addEventListener('resize', updatePill);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePill);
    };
  }, [pathname]);

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-black/50 rounded-full px-6 py-3 flex items-center transition-all duration-300">
          
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-sm">
                {kosName.charAt(0)}
              </div>
              <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white transition-all duration-300">
                {kosName}
              </span>
            </Link>
          </div>

          {/* TENGAH: Menu Navigasi dengan Pil Native CSS */}
          <div className="flex-none flex items-center gap-1 relative">
            {/* Pil Background yang Bergeser */}
            <div 
              className="absolute bg-gray-900 dark:bg-white rounded-full shadow-md pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{
                left: `${desktopPill.left}px`,
                top: `${desktopPill.top}px`,
                width: `${desktopPill.width}px`,
                height: `${desktopPill.height}px`,
                opacity: desktopPill.opacity,
                zIndex: 0
              }}
            />
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  href={link.path} 
                  ref={el => desktopRefs.current[idx] = el}
                  className={`relative px-5 py-2.5 rounded-full font-bold text-sm transition-colors duration-300 active:scale-95 select-none z-10 ${
                    isActive ? 'text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
              <button onClick={toggleTheme} className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
                {theme === 'light' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
              </button>
              <Link href="/admin" className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            </div>
          </div>
          
        </div>
      </nav>

      {/* MOBILE NAVBAR */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 rounded-[2rem] p-2 flex justify-between items-center transition-all duration-300 relative">
          
          {/* Pil Background Mobile yang Bergeser */}
          <div 
            className="absolute bg-blue-50 dark:bg-blue-900/30 rounded-2xl pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              left: `${mobilePill.left}px`,
              top: `${mobilePill.top}px`,
              width: `${mobilePill.width}px`,
              height: `${mobilePill.height}px`,
              opacity: mobilePill.opacity,
              zIndex: 0
            }}
          />

          {navLinks.map((link, idx) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.name} 
                href={link.path} 
                ref={el => mobileRefs.current[idx] = el}
                className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors duration-300 active:scale-90 select-none z-10 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <svg className={`w-6 h-6 mb-1 relative z-10 transition-all ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{link.icon}</svg>
                <span className={`text-[10px] relative z-10 transition-all ${isActive ? 'font-black' : 'font-bold'}`}>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 relative z-10"></div>
          <button onClick={toggleTheme} className="w-12 h-14 flex flex-col items-center justify-center rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90 relative z-10">
            {theme === 'light' ? <svg className="w-6 h-6 stroke-2 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-6 h-6 stroke-2 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
            <span className="text-[10px] font-bold">Tema</span>
          </button>
        </div>
      </nav>
      
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#f2f4f7] to-transparent dark:from-gray-950 z-40 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow-md transition-all">
            {kosName.charAt(0)}
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white drop-shadow-sm transition-all duration-300">
            {kosName}
          </span>
        </div>
      </div>
    </>
  );
}