'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicWrapper from '../components/publicWrapper';

export default function Home() {
  const [content, setContent] = useState(null);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [resContent, resRooms] = await Promise.all([
          fetch('/api/konten'), fetch('/api/kamar')
        ]);
        if (resContent.ok) {
          const dataContent = await resContent.json();
          setContent(Array.isArray(dataContent) ? dataContent[0] : dataContent);
        }
        if (resRooms.ok) {
          const dataRooms = await resRooms.json();
          if (Array.isArray(dataRooms)) {
            setFeaturedRooms(dataRooms.filter(r => r.status === 'Available').slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const formatRupiah = (number) => number ? "Rp " + number.toLocaleString('id-ID') : "-";
  const kosName = content?.kosName || "Garuda Kostel";
  const heroTitle = content?.heroTitle || "Kenyamanan Kost, Fasilitas Setara Hotel.";
  const heroSubtitle = content?.heroSubtitle || `Nikmati pengalaman menginap eksklusif di ${kosName}. Bersih, aman, dan berlokasi strategis.`;

  // Kumpulan Data SVG Ikon Fasilitas
const fasilitasIcons = [
    {
      label: 'Full AC',
      icon: (
        <svg className="w-8 h-8 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Bentuk mesin AC */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v2.25A2.25 2.25 0 0118.75 12.75H5.25A2.25 2.25 0 013 10.5V8.25z" />
          {/* Hembusan angin sejuk */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 16.5v1.5M12 16.5v2.25M16.5 16.5v1.5" />
          {/* Lampu indikator LED */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 9.5h.01" />
        </svg>
      )
    },
    {
      label: 'Free Wi-Fi',
      icon: (
        <svg className="w-8 h-8 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      )
    },
    {
      label: 'K. Mandi Dalam',
      icon: (
        <svg className="w-8 h-8 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Pipa dan Kepala Shower */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v4M8 10h8a2 2 0 00-2-4h-4a2 2 0 00-2 4z" />
          {/* Tetesan Air Mengalir */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13v2m0 2v3M12 14v2m0 2v3M15 13v2m0 2v3" />
        </svg>
      )
    },
    {
      label: 'Layanan Bersih',
      icon: (
        <svg className="w-8 h-8 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Sapu di sebelah kiri */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4v8M5 12h6l-1 7H6l-1-7z" />
          {/* Serok (Dustpan) di sebelah kanan */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 7v6M14 13h6l1 6h-8l1-6z" />
        </svg>
      )
    }
  ];

  if (isLoading) {
    return (
      <PublicWrapper>
        <div className="max-w-7xl mx-auto px-6 animate-pulse min-h-[100vh]">
          <div className="w-3/4 md:w-1/2 h-12 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-6 mt-10"></div>
          <div className="w-full md:w-2/3 h-6 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
          <div className="w-4/5 md:w-1/2 h-6 bg-gray-200 dark:bg-gray-800 rounded-xl mb-12"></div>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      {/* HERO SECTION - Menggunakan Grid 2 Kolom */}
      <section className="max-w-7xl mx-auto px-6 mb-20 md:mb-32 overflow-hidden pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Kolom Kiri: Teks & Tombol */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-full text-xs md:text-sm mb-6 border border-blue-100 dark:border-blue-800/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              {kosName}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/kamar" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-blue-500/30 transition-all active:scale-95">
                Lihat Kamar Tersedia
              </Link>
              <Link href="/lokasi" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold py-4 px-8 rounded-full shadow-sm transition-all active:scale-95">
                Cek Lokasi
              </Link>
            </div>
          </motion.div>

          {/* Kolom Kanan: Foto Bangunan */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-gray-800 group"
          >
            <img 
              src="/Building.jpg" 
              alt={`Bangunan ${kosName}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>
          
        </div>
      </section>

      {/* QUICK HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-6 mb-20 md:mb-32 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">Kenapa {kosName}?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                Dirancang khusus untuk Anda yang mengutamakan privasi dan kenyamanan tingkat tinggi. Setiap kamar dilengkapi dengan AC, Smart TV, Wi-Fi berkecepatan tinggi, dan kamar mandi dalam eksklusif.
              </p>
              <Link href="/fasilitas" className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Pelajari semua fasilitas <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {fasilitasIcons.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl flex flex-col items-center justify-center text-center"
                >
                  {item.icon}
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* PREVIEW KAMAR */}
      <section className="max-w-7xl mx-auto px-6 overflow-hidden mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Kamar Tersedia</h2>
          <Link href="/kamar" className="hidden md:flex text-blue-600 dark:text-blue-400 font-bold items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-5 py-2.5 rounded-full transition-all active:scale-95">
            Lihat Semua <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </motion.div>

        {featuredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((room, index) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group flex flex-col"
              >
                <div className="relative h-56 md:h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {room.photoUrl ? (
                    <img src={room.photoUrl} alt={`Kamar ${room.number}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">Tanpa Foto</div>
                  )}
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">TERSEDIA</div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Kamar {room.number}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">Lantai {room.floor}</p>
                    <div className="space-y-1 mb-6">
                      <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">Mulai dari</p>
                      
                      {/* LOGIKA HARGA CERDAS BERDASARKAN BULANAN/HARIAN */}
                      {room.priceMonthly > 0 ? (
                        <div className="flex items-end gap-2">
                          <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(room.priceMonthly)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">/ bulan</span>
                        </div>
                      ) : (
                        <div className="flex items-end gap-2">
                          <span className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatRupiah(room.priceDaily)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">/ hari</span>
                        </div>
                      )}

                    </div>
                  </div>
                  <Link href="/kamar" className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-800 dark:text-gray-200 font-bold py-3.5 rounded-2xl transition-all duration-300 active:scale-95">Lihat Detail</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum ada kamar tersedia</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Semua kamar sedang penuh saat ini.</p>
          </div>
        )}
      </section>
    </PublicWrapper>
  );
}