'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicWrapper from '../../components/publicWrapper';
import RoomModal from '../../components/RoomModal';

export default function KamarPublic() {
  const [roomTypes, setRoomTypes] = useState([]); 
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRooms, resKonten] = await Promise.all([ fetch('/api/kamar'), fetch('/api/konten') ]);
        if (resRooms.ok) {
          const dataRooms = await resRooms.json();
          if (Array.isArray(dataRooms)) {
            // Mengelompokkan kamar berdasarkan Kategori Tipe
            const grouped = {};
            dataRooms.forEach(room => {
              const typeName = room.type || 'Standard Room';
              
              if (!grouped[typeName]) {
                grouped[typeName] = {
                  id: typeName,
                  typeName,
                  minPriceMonthly: room.priceMonthly || 0,
                  minPriceDaily: room.priceDaily || 0,
                  photoUrl: room.photoUrl || '',
                  photoUrl2: room.photoUrl2 || '',
                  photoUrl3: room.photoUrl3 || ''
                };
              }

              // Cari harga termurah untuk "Mulai dari"
              if (room.priceMonthly > 0 && (grouped[typeName].minPriceMonthly === 0 || room.priceMonthly < grouped[typeName].minPriceMonthly)) {
                grouped[typeName].minPriceMonthly = room.priceMonthly;
              }
              if (room.priceDaily > 0 && (grouped[typeName].minPriceDaily === 0 || room.priceDaily < grouped[typeName].minPriceDaily)) {
                grouped[typeName].minPriceDaily = room.priceDaily;
              }

              // Jika foto utama kosong tapi kamar lain di tipe ini punya foto, ambil fotonya
              if (!grouped[typeName].photoUrl && room.photoUrl) grouped[typeName].photoUrl = room.photoUrl;
              if (!grouped[typeName].photoUrl2 && room.photoUrl2) grouped[typeName].photoUrl2 = room.photoUrl2;
              if (!grouped[typeName].photoUrl3 && room.photoUrl3) grouped[typeName].photoUrl3 = room.photoUrl3;
            });

            // Urutkan agar Standard Room tampil lebih dulu jika ada
            const sortedTypes = Object.values(grouped).sort((a, b) => {
              if (a.typeName.includes('Standard')) return -1;
              if (b.typeName.includes('Standard')) return 1;
              return 0;
            });

            setRoomTypes(sortedTypes);
          }
        }
        if (resKonten.ok) {
          const dataKonten = await resKonten.json();
          setSettings(Array.isArray(dataKonten) ? dataKonten[0] : dataKonten);
        }
      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRupiah = (number) => number ? "Rp " + number.toLocaleString('id-ID') : "-";

  if (isLoading) {
    return (
      <PublicWrapper>
        <div className="max-w-7xl mx-auto px-6 pt-10 animate-pulse min-h-[100vh]">
          <div className="w-64 h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
          <div className="w-80 h-6 bg-gray-200 dark:bg-gray-800 rounded-xl mb-12"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-800 rounded-[3rem]"></div>
            <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-800 rounded-[3rem]"></div>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-10 overflow-hidden mb-32">
        
        {/* Header Section (Gaya Brosur) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 md:mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-4 py-2 rounded-full text-xs md:text-sm mb-4 border border-blue-100 dark:border-blue-800/50">
            Katalog Eksklusif
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Pilihan Tipe Kamar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-2xl">
            Tingkatkan kualitas istirahat Anda. Pilih tipe kamar yang paling sesuai dengan kebutuhan ruang dan privasi Anda.
          </p>
        </motion.div>

        {/* Grid Katalog Tipe Kamar (Diubah ke 2 Kolom Besar agar seperti pameran) */}
        {roomTypes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {roomTypes.map((group, index) => {
              return (
                <motion.div 
                  key={group.id} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                  onClick={() => {
                    // Mensimulasikan struktur data untuk RoomModal
                    setSelectedRoom({
                      number: group.typeName, 
                      floor: '-', 
                      priceMonthly: group.minPriceMonthly,
                      priceDaily: group.minPriceDaily,
                      photoUrl: group.photoUrl,
                      photoUrl2: group.photoUrl2,
                      photoUrl3: group.photoUrl3
                    });
                  }}
                  className="bg-white dark:bg-gray-800 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 group"
                >
                  {/* Area Foto Utama Besar */}
                  <div className="relative h-64 md:h-80 bg-gray-200 dark:bg-gray-900 overflow-hidden">
                    {group.photoUrl ? (
                      <img src={group.photoUrl} alt={group.typeName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-bold bg-gray-100 dark:bg-gray-800">
                        <span className="text-4xl mb-2 opacity-50">📸</span>
                        <span>Foto Segera Hadir</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                    
                    {/* Badge Tipe di Atas Foto */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-3xl md:text-4xl font-black text-white leading-tight shadow-sm drop-shadow-md">
                        {group.typeName}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Area Info & Fasilitas */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow bg-white dark:bg-gray-800">
                    
                    {/* Highlight Fasilitas Minimalis */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Fasilitas Unggulan</p>
                      <div className="flex flex-wrap gap-2">
                        {['Kamar Mandi Dalam', 'Full AC', 'Smart TV', 'Wi-Fi Gratis'].map((fasilitas, i) => (
                          <span key={i} className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-600">
                            ✓ {fasilitas}
                          </span>
                        ))}
                        <span className="text-blue-500 dark:text-blue-400 text-xs font-bold px-2 py-1.5 flex items-center">
                          + Fasilitas Lainnya
                        </span>
                      </div>
                    </div>

                    {/* Pembatas */}
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-2 mb-6"></div>

                    {/* Harga & Tombol */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-auto">
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Mulai Dari</p>
                        {group.minPriceMonthly > 0 ? (
                          <div className="flex items-end gap-1.5">
                            <span className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 leading-none">{formatRupiah(group.minPriceMonthly)}</span>
                            <span className="text-sm text-gray-500 font-medium mb-1">/ bulan</span>
                          </div>
                        ) : (
                          <div className="flex items-end gap-1.5">
                            <span className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{formatRupiah(group.minPriceDaily)}</span>
                            <span className="text-sm text-gray-500 font-medium mb-1">/ hari</span>
                          </div>
                        )}
                      </div>

                      <button className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3.5 px-6 rounded-2xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                        Lihat Galeri Kamar
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-16 text-center border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
            <span className="text-6xl mb-4">🏠</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Belum ada tipe kamar</h3>
            <p className="text-gray-500 dark:text-gray-400">Silakan kembali lagi nanti untuk melihat katalog kamar kami.</p>
          </div>
        )}
      </div>

      {/* Render Modal Detail Kamar */}
      {selectedRoom && (
        <RoomModal room={selectedRoom} onClose={() => setSelectedRoom(null)} waNumber={settings?.waNumber} kosName={settings?.kosName} />
      )}
    </PublicWrapper>
  );
}