'use client';
import PublicWrapper from '../../components/publicWrapper';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Lokasi() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/konten').then(r => r.json()).then(data => {
      setSettings(Array.isArray(data) ? data[0] : data);
    }).catch(e => console.error(e));
  }, []);

  const kosName = settings?.kosName || "Garuda Kostel";
  // Default address disesuaikan dengan Garuda Kostel Tegal yang asli
  const address = settings?.address || "Jl. Garuda No.9, Randugunting, Tegal Selatan, Kota Tegal, Jawa Tengah 52131";
  
  // Ambil link maps dari pengaturan admin. Jika kosong, gunakan link asli Tegal.
  const mapsLink = settings?.mapsLink || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.246830508182!2d109.13063871526462!3d-6.861005295041926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fb9df0e3a4785%3A0xc3d87b322a36b5db!2sGaruda%20Kostel!5e0!3m2!1sid!2sid!4v1699999999999!5m2!1sid!2sid";
  
  const waNumber = settings?.waNumber || "6282140464565";
  const waMessage = `Halo Admin ${kosName}, saya butuh panduan arah menuju lokasi. Bisa dibantu?`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // Fungsi untuk memisahkan link Embed Maps agar tombol "Buka Google Maps" bisa membuka di aplikasi/tab baru (tanpa embel-embel /embed)
  const extractCleanMapUrl = (embedUrl) => {
    if (!embedUrl || !embedUrl.includes('google.com/maps')) return "https://maps.google.com";
    // Jika admin memasukkan link pendek biasa secara tidak sengaja, biarkan saja
    if (!embedUrl.includes('/embed?')) return embedUrl;
    // Mengembalikan ke halaman Maps reguler untuk tombol eksternal
    return embedUrl.replace('/embed?', '/search?');
  };

  const cleanExternalLink = extractCleanMapUrl(mapsLink);

  // Landmark Asli (Sesuai dengan Data Garuda Kostel, Tegal di Tiket.com & Traveloka)
  const nearbyLandmarks = [
    { type: '🛍️', name: 'Pacific Mall Tegal', distance: '500 meter (5 Menit)', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { type: '🎡', name: 'Alun-Alun Tegal & Masjid Agung', distance: '900 meter (8 Menit)', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { type: '🚉', name: 'Stasiun Kereta Tegal', distance: '1.3 km (10 Menit)', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { type: '🌊', name: 'Pantai Alam Indah (PAI)', distance: '3.1 km (12 Menit)', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { type: '🏊‍♂️', name: 'Bahari Waterpark Tegal', distance: '2.4 km (10 Menit)', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  ];

  return (
    <PublicWrapper>
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Lokasi Strategis</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
            Berada tepat di tengah Kota Tegal, {kosName} memberikan kemudahan akses ke pusat perbelanjaan, stasiun, hingga area wisata pantai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mb-20">
          
          {/* Kolom Peta (Geser dari Kiri) */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-3 bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 h-[400px] md:h-[600px] relative group overflow-hidden flex items-center justify-center"
          >
            {/* Embed Iframe DINAMIS: mengambil dari `mapsLink` */}
            <iframe 
              src={mapsLink} 
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '2.5rem' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[20%] contrast-125 dark:opacity-80 transition-all duration-500 group-hover:grayscale-0"
            ></iframe>
            
            {/* Tombol Eksternal dinamis */}
            <a href={cleanExternalLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 text-sm z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Buka Google Maps
            </a>
          </motion.div>

          {/* Kolom Info (Geser dari Kanan) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="bg-blue-600 dark:bg-blue-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">{kosName}</h3>
                <p className="text-blue-100 leading-relaxed mb-6 font-medium text-sm md:text-base">{address}</p>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="block text-center bg-white text-blue-600 font-bold py-3.5 rounded-2xl transition-all hover:bg-gray-50 active:scale-95 text-sm">
                  Tanya Admin (WA)
                </a>
              </div>
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700 flex-grow">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Landmark Terdekat</h3>
              <div className="space-y-5">
                {nearbyLandmarks.map((landmark, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${landmark.color}`}>{landmark.type}</div>
                    <div className="flex-1 border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
                      <h4 className="font-black text-gray-900 dark:text-gray-100 text-sm">{landmark.name}</h4>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{landmark.distance}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicWrapper>
  );
}