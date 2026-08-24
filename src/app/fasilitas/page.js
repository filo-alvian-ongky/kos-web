'use client';
import { useState, useEffect } from 'react';
import PublicWrapper from '../../components/publicWrapper';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Fasilitas() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi loading agar transisi antar halaman terasa konsisten dan premium
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); 
    return () => clearTimeout(timer);
  }, []);

  const roomFacilities = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v2.25A2.25 2.25 0 0118.75 12.75H5.25A2.25 2.25 0 013 10.5V8.25z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 16.5v1.5M12 16.5v2.25M16.5 16.5v1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 9.5h.01" />
        </svg>
      ),
      title: 'Full AC',
      desc: 'Suhu ruangan selalu sejuk dan nyaman sepanjang hari.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      title: 'Free Wi-Fi',
      desc: 'Internet berkecepatan tinggi tanpa batas kuota.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Smart TV',
      desc: 'Nikmati Netflix & YouTube langsung dari kamar Anda.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v4M8 10h8a2 2 0 00-2-4h-4a2 2 0 00-2 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13v2m0 2v3M12 14v2m0 2v3M15 13v2m0 2v3" />
        </svg>
      ),
      title: 'K. Mandi Dalam',
      desc: 'Lengkap dengan shower, closet duduk, & exhaust.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21v-3m0 0V9a2 2 0 012-2h14a2 2 0 012 2v9m-18 0h18m-18 0V9M12 12v3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 11h10a1 1 0 001-1V9a1 1 0 00-1-1H7a1 1 0 00-1 1v1a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Kasur Premium',
      desc: 'Springbed empuk ukuran standar lengkap dengan bantal.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 21V9a2 2 0 012-2h8a2 2 0 012 2v12M6 13h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      ),
      title: 'Full Furnished',
      desc: 'Dilengkapi lemari pakaian luas dan meja kerja/belajar.'
    }
  ];

  const sharedFacilities = [
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v2m0 4v12M8 11h8M8 15h8M8 19h8M6 7a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
        </svg>
      ),
      title: 'Dapur Bersama',
      desc: 'Tersedia kompor, kulkas, dan alat masak dasar.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zm-9-4H4a1 1 0 01-1-1v-2a2 2 0 012-2h1.5l2.5-3.5A2 2 0 0110.6 3h2.8a2 2 0 011.6.8L17.5 7.3H19a2 2 0 012 2v2a1 1 0 01-1 1h-3" />
        </svg>
      ),
      title: 'Parkir Luas',
      desc: 'Area parkir aman untuk motor dan mobil penghuni.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'CCTV 24 Jam',
      desc: 'Sistem keamanan terpadu di seluruh area publik kostel.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 8H4a2 2 0 00-2 2v7h22v-7a2 2 0 00-2-2zM4 17v4m16-4v4M8 8V5a2 2 0 012-2h4a2 2 0 012 2v3" />
        </svg>
      ),
      title: 'Ruang Komunal',
      desc: 'Area bersantai dan mengobrol yang nyaman.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4v8M5 12h6l-1 7H6l-1-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 7v6M14 13h6l1 6h-8l1-6z" />
        </svg>
      ),
      title: 'Housekeeping',
      desc: 'Layanan pembersihan area luar dan koridor rutin.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 7.5h.01M6.5 7.5h.01" />
        </svg>
      ),
      title: 'Area Cuci Jemur',
      desc: 'Fasilitas untuk mencuci dan menjemur pakaian mandiri.'
    }
  ];

  // EFEK SKELETON LOADER
  if (isLoading) {
    return (
      <PublicWrapper>
        <div className="max-w-7xl mx-auto px-6 pt-8 overflow-hidden animate-pulse mb-32">
          
          {/* Skeleton Header Fasilitas */}
          <div className="flex flex-col items-center max-w-2xl mx-auto mb-16 md:mb-20 pt-8">
            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
            <div className="w-3/4 md:w-full h-12 md:h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
            <div className="w-5/6 h-5 bg-gray-200 dark:bg-gray-800 rounded-xl mb-2"></div>
            <div className="w-2/3 h-5 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>

          {/* Skeleton Section 1 */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-64 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
                  <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
                  <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Section 2 */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-64 h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
                  <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
                  <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Banner CTA */}
          <div className="bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] h-64 md:h-80 mb-10"></div>
          
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        
        {/* Header Fasilitas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16 md:mb-20 pt-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-full text-xs md:text-sm mb-4 border border-blue-100 dark:border-blue-800/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Standar Hotel
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Fasilitas Terbaik untuk Anda
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
            Semua yang Anda butuhkan untuk kenyamanan hidup sehari-hari sudah kami siapkan. Anda cukup bawa koper dan bersantai.
          </p>
        </motion.div>

        {/* Section: Fasilitas Kamar */}
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fasilitas Kamar (Pribadi)</h2>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomFacilities.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 3) * 0.15, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group cursor-default"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section: Fasilitas Bersama */}
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fasilitas Bersama (Umum)</h2>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-grow"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedFacilities.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (idx % 3) * 0.15, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 group cursor-default"
              >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-blue-600 dark:bg-blue-700 rounded-[2.5rem] p-8 md:p-12 text-center text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden mb-10"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Tertarik menikmati fasilitas ini?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto font-medium">Jangan sampai kehabisan. Cek ketersediaan kamar yang cocok untuk Anda sekarang juga.</p>
            <Link href="/kamar" className="inline-block bg-white text-blue-600 font-black px-8 py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-all duration-300 active:scale-95">
              Lihat Kamar Tersedia
            </Link>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        </motion.div>

      </div>
    </PublicWrapper>
  );
}