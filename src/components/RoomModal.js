'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomModal({ room, onClose, waNumber = "6282140464565", kosName = "Garuda Kostel" }) {
  // State untuk menyimpan urutan gambar yang sedang tampil
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mengumpulkan gambar yang ada isinya saja ke dalam satu Array
  const images = room ? [room.photoUrl, room.photoUrl2, room.photoUrl3].filter(img => img && img !== "") : [];

  // Reset slider ke gambar pertama setiap kali modal baru dibuka
  useEffect(() => {
    if (room) setCurrentIndex(0);
  }, [room]);

  // Efek ganti gambar otomatis setiap 4 detik
  useEffect(() => {
    let timer;
    if (room && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [room, images.length]);

  // Fungsi deteksi gestur geser (drag)
  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      // Geser kiri (Next)
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else if (swipe > 50) {
      // Geser kanan (Prev)
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatRupiah = (number) => number ? "Rp " + number.toLocaleString('id-ID') : "-";
  
  // Pesan WhatsApp disesuaikan untuk menanyakan ketersediaan TIPE kamar (karena "number" saat ini berisi nama tipe)
  const waMessage = room ? `Halo Admin ${kosName}, saya tertarik dengan tipe ${room.number}. Apakah saat ini ada kamar yang kosong?` : '';
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // Varian animasi Slider untuk framer-motion
  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <AnimatePresence>
      {room && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Background Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-700 relative z-10"
          >
            {/* Header Modal - Menampilkan Nama Tipe */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-20">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{room.number}</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Katalog Pilihan Kamar</p>
              </div>
              <button onClick={onClose} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-10 h-10 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 active:scale-90 flex items-center justify-center">
                ✕
              </button>
            </div>
            
            {/* Body Modal (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6 hide-scrollbar">
              
              {/* BAGIAN SLIDER GAMBAR */}
              {images.length > 0 ? (
                <div className="relative w-full h-56 md:h-72 rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner group border border-gray-100 dark:border-gray-700">
                  <AnimatePresence initial={false} custom={currentIndex}>
                    <motion.img
                      key={currentIndex}
                      src={images[currentIndex]}
                      alt={`Fasilitas ${room.number} - Foto ${currentIndex + 1}`}
                      className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                      drag="x" 
                      dragConstraints={{ left: 0, right: 0 }} 
                      dragElastic={1}
                      onDragEnd={handleDragEnd}
                    />
                  </AnimatePresence>
                  
                  {/* Titik Indikator Slider (Dots) */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                      {images.map((_, i) => (
                        <div 
                          key={i} 
                          className={`transition-all duration-300 rounded-full shadow-md ${i === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/60 backdrop-blur-sm'}`} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 bg-gray-50 dark:bg-gray-900 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <span className="text-4xl mb-3 opacity-50">📸</span>
                  <span className="text-sm font-medium">Belum Ada Foto</span>
                </div>
              )}
              
              {/* Rincian Harga */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">Kisaran Harga</span>
                  <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Tipe {room.number}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {room.priceMonthly > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Mulai Dari (Bulanan)</p>
                      <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{formatRupiah(room.priceMonthly)}</p>
                    </div>
                  )}
                  {room.priceDaily > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Mulai Dari (Harian)</p>
                      <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{formatRupiah(room.priceDaily)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fasilitas Kamar */}
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-3 px-1">Fasilitas Termasuk</h4>
                <div className="flex flex-wrap gap-2">
                  {['Full AC', 'Kamar Mandi Dalam', 'Smart TV', 'Wi-Fi Cepat', 'Lemari Pakaian', 'Meja Belajar', 'Jendela Luar'].map((fasilitas, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600/50">
                      {fasilitas}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal (Tombol Action Tanya Ketersediaan) */}
            <div className="p-5 md:p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3">
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-300 active:scale-95"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Tanya Ketersediaan Kamar
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}