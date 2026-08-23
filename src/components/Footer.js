'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group active:scale-95 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-base uppercase shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {settings.kosName ? settings.kosName.charAt(0) : 'G'}
              </div>
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