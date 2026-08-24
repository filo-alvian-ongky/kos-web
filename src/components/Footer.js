'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Vektor Logo Garuda Kostel (Konsisten dengan Navbar)
const GarudaLogo = ({ className = "w-10 h-auto" }) => (
  <svg viewBox="0 0 125 80" className={className} xmlns="http://www.w3.org/2000/svg">
    <g>
      {/* Sayap Kiri */}
      <path d="M40 32 C25 32 15 26 5 19 C15 29 25 36 40 37 Z" className="fill-gray-900 dark:fill-white" />
      <path d="M40 44 C25 44 15 40 5 36 C15 44 25 48 40 49 Z" className="fill-gray-900 dark:fill-white" />
      <path d="M40 56 C25 56 15 54 5 53 C15 59 25 60 40 61 Z" className="fill-gray-900 dark:fill-white" />
      
      {/* Sayap Kanan */}
      <path d="M85 32 C100 32 110 26 120 19 C110 29 100 36 85 37 Z" className="fill-gray-900 dark:fill-white" />
      <path d="M85 44 C100 44 110 40 120 36 C110 44 100 48 85 49 Z" className="fill-gray-900 dark:fill-white" />
      <path d="M85 56 C100 56 110 54 120 53 C110 59 100 60 85 61 Z" className="fill-gray-900 dark:fill-white" />
      
      {/* Atap & Cerobong */}
      <rect x="73" y="12" width="6" height="12" className="fill-gray-500 dark:fill-gray-400" />
      <path d="M 35 30 L 62.5 10 L 90 30 H 82 L 62.5 16 L 43 30 Z" className="fill-gray-500 dark:fill-gray-400" />
      
      {/* Kotak Merah & Huruf GK */}
      <rect x="40" y="25" width="45" height="38" rx="6" className="fill-red-600 dark:fill-red-500" />
      <path d="M 46 33 H 56 V 37 H 50 V 51 H 58 V 45 H 54 V 41 H 62 V 55 H 46 Z" fill="#FFFFFF" />
      <path d="M 61 33 H 65 V 42 L 72 33 H 78 L 69 43 L 79 55 H 72 L 65 46 V 55 H 61 Z" fill="#FFFFFF" />
    </g>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({ 
    kosName: 'Garuda Kostel', 
    waNumber: '6281234567890' 
  });

  useEffect(() => {
    fetch('/api/konten')
      .then(r => r.json())
      .then(data => {
        const d = Array.isArray(data) ? data[0] : data;
        if (d && d.waNumber) {
          setSettings(prev => ({
            ...prev,
            kosName: d.kosName || prev.kosName,
            waNumber: d.waNumber || prev.waNumber
          }));
        }
      })
      .catch(e => console.error(e));
  }, []);

  // Format link WhatsApp secara dinamis berdasarkan state settings terbaru
  const cleanWaNumber = settings.waNumber ? settings.waNumber.replace(/\D/g, '') : '6281234567890';
  const waMessage = `Halo Admin ${settings.kosName}, saya ingin bertanya seputar ketersediaan kamar.`;
  const waLink = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-28 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
          
          {/* Kolom Logo & Deskripsi */}
          <div className="text-center md:text-left flex-1">
            <Link href="/" className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-5 group active:scale-95 transition-all duration-300">
              
              {/* Logo Vektor di Footer */}
              <GarudaLogo className="w-16 md:w-14 h-auto shrink-0 drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
              
              <span className="font-black text-2xl tracking-tight text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {settings.kosName}
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-xs mx-auto md:mx-0 leading-relaxed">
              Menghadirkan kenyamanan hunian eksklusif dengan fasilitas premium untuk menunjang gaya hidup modern Anda.
            </p>
          </div>

          {/* Kolom Quick Links */}
          <div className="flex gap-12 md:gap-16 text-center md:text-left mt-8 md:mt-0">
            
            {/* Menu Navigasi */}
            <div className="flex flex-col gap-4">
              <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-2 opacity-80">Menu</h4>
              
              <Link href="/" className="group relative w-fit mx-auto md:mx-0 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center">
                <span className="transition-transform duration-300 group-hover:translate-x-1">Beranda</span>
                <span className="absolute left-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300 text-blue-500">→</span>
              </Link>
              
              <Link href="/kamar" className="group relative w-fit mx-auto md:mx-0 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center">
                <span className="transition-transform duration-300 group-hover:translate-x-1">Daftar Kamar</span>
                <span className="absolute left-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300 text-blue-500">→</span>
              </Link>
              
              <Link href="/fasilitas" className="group relative w-fit mx-auto md:mx-0 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center">
                <span className="transition-transform duration-300 group-hover:translate-x-1">Fasilitas</span>
                <span className="absolute left-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300 text-blue-500">→</span>
              </Link>
            </div>

            {/* Menu Bantuan */}
            <div className="flex flex-col gap-4">
              <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-2 opacity-80">Bantuan</h4>
              
              <Link href="/lokasi" className="group relative w-fit mx-auto md:mx-0 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 flex items-center">
                <span className="transition-transform duration-300 group-hover:translate-x-1">Cek Lokasi</span>
                <span className="absolute left-full opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300 text-blue-500">→</span>
              </Link>
              
              {/* Tombol Kontak Khusus Warna Hijau */}
              <a href={waLink} target="_blank" rel="noreferrer" className="group relative w-fit mx-auto md:mx-0 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 flex items-center">
                <span className="transition-transform duration-300 group-hover:translate-x-1">Hubungi Admin</span>
                <span className="absolute left-full opacity-0 -translate-x-2 translate-y-1 group-hover:opacity-100 group-hover:translate-x-1.5 group-hover:-translate-y-0.5 transition-all duration-300 text-emerald-500">↗</span>
              </a>
            </div>

          </div>
        </div>

        {/* Garis Copyright Bawah */}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 cursor-default">
            &copy; {currentYear} {settings.kosName} Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}