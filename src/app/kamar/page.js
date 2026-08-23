'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicWrapper from '../../components/publicWrapper';
import RoomModal from '../../components/RoomModal';

export default function KamarPublic() {
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRooms, resKonten] = await Promise.all([ fetch('/api/kamar'), fetch('/api/konten') ]);
        if (resRooms.ok) {
          const dataRooms = await resRooms.json();
          if (Array.isArray(dataRooms)) setRooms(dataRooms.filter(r => r.status === 'Available' || r.status === 'Booked'));
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
  const filteredRooms = rooms.filter(r => {
    const matchSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = filterFloor === 'All' || String(r.floor) === filterFloor;
    return matchSearch && matchFloor;
  });

  if (isLoading) {
    return (
      <PublicWrapper>
        <div className="max-w-7xl mx-auto px-6 pt-4 animate-pulse min-h-[100vh]">
          <div className="w-48 h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
          <div className="w-64 h-5 bg-gray-200 dark:bg-gray-800 rounded-xl mb-10"></div>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="max-w-7xl mx-auto px-6 pt-4 overflow-hidden">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Daftar Kamar</h1>
          <p className="text-gray-500 dark:text-gray-400">Temukan kenyamanan eksklusif yang sesuai dengan kebutuhan Anda.</p>
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-3 mb-10">
          <div className="relative flex-grow max-w-md">
            <input type="text" placeholder="Cari nomor kamar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 pl-12 rounded-2xl font-bold text-sm transition-colors focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"/>
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)} className="w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3.5 rounded-2xl font-bold text-sm cursor-pointer shadow-sm outline-none transition-colors">
            <option value="All">Semua Lantai</option>
            <option value="1">Lantai 1</option>
            <option value="2">Lantai 2</option>
            <option value="3">Lantai 3</option>
          </select>
        </motion.div>

        {/* Grid Kamar */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, index) => {
              const isAvailable = room.status === 'Available';
              return (
                <motion.div 
                  key={room.id} 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onClick={() => setSelectedRoom(room)}
                  className={`bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${!isAvailable && 'opacity-70 grayscale-[30%]'}`}
                >
                  <div className="relative h-56 bg-gray-200 dark:bg-gray-900 overflow-hidden">
                    {room.photoUrl ? (
                      <img src={room.photoUrl} alt={`Kamar ${room.number}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">Tanpa Foto</div>
                    )}
                    <div className={`absolute top-4 right-4 text-xs font-black px-3 py-1.5 rounded-full shadow-lg ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isAvailable ? 'TERSEDIA' : 'PENUH'}
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col flex-grow justify-between bg-white dark:bg-gray-800">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">Kamar {room.number}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Lantai {room.floor}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Mulai Dari</p>
                        
                        {/* LOGIKA HARGA CERDAS */}
                        {room.priceMonthly > 0 ? (
                          <div className="flex items-end gap-1">
                            <span className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(room.priceMonthly)}</span>
                            <span className="text-xs text-gray-500 font-medium mb-1">/ bulan</span>
                          </div>
                        ) : (
                          <div className="flex items-end gap-1">
                            <span className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatRupiah(room.priceDaily)}</span>
                            <span className="text-xs text-gray-500 font-medium mb-1">/ hari</span>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kamar tidak ditemukan</h3>
          </div>
        )}
      </div>

      {selectedRoom && (
        <RoomModal room={selectedRoom} onClose={() => setSelectedRoom(null)} waNumber={settings?.waNumber} kosName={settings?.kosName} />
      )}
    </PublicWrapper>
  );
}