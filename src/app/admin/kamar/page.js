'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminKamar() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  
  const [theme, setTheme] = useState('light');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State Modal Konfirmasi Hapus Kamar
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State Form Kamar (Default diubah menjadi Standard Double Bed)
  const [newRoom, setNewRoom] = useState({
    number: '', floor: '1', type: 'Standard Double Bed', priceDaily: '', priceMonthly: '', status: 'Available', photoUrl: '', photoUrl2: '', photoUrl3: ''
  });

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    type: '', priceDaily: '', priceMonthly: '', status: '', photoUrl: '', photoUrl2: '', photoUrl3: ''
  });

  const topButtonRef = useRef(null);
  const [showFAB, setShowFAB] = useState(false);
  const [isAnimateReady, setIsAnimateReady] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All'); // State baru untuk filter kategori

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500); 
  };

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

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => setIsAnimateReady(true), 100);
    const observer = new IntersectionObserver(
      ([entry]) => setShowFAB(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" } 
    );
    if (topButtonRef.current) observer.observe(topButtonRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/kamar');
      const data = await res.json();
      if (Array.isArray(data)) setRooms(data);
      else setRooms([]);
    } catch (error) {
      showToast("Gagal mengambil data kamar:", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const formatRoomNumber = (num, floor) => {
    let res = num.trim();
    if (!res) return '';
    if (res.startsWith(floor) && res.length >= 3) return res;
    while (res.startsWith('0')) res = res.substring(1);
    if (res.length === 1) return floor + "0" + res;
    if (res.length >= 2) return floor + res;
    return res;
  };

  const handleNumberChange = (e) => {
    setNewRoom({ ...newRoom, number: e.target.value.toUpperCase() });
  };

  const handleNumberBlur = () => {
    setNewRoom({ ...newRoom, number: formatRoomNumber(newRoom.number, newRoom.floor) });
  };

  const handleFloorChange = (e) => {
    const newFloor = e.target.value;
    let currentNum = newRoom.number.trim();
    
    if (currentNum.startsWith(newRoom.floor) && currentNum.length >= 3) {
        currentNum = currentNum.substring(newRoom.floor.length);
        while (currentNum.startsWith('0')) currentNum = currentNum.substring(1);
    }
    
    setNewRoom({ 
        ...newRoom, 
        floor: newFloor, 
        number: formatRoomNumber(currentNum, newFloor) 
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setNewRoom({ number: '', floor: '1', type: 'Standard Double Bed', priceDaily: '', priceMonthly: '', status: 'Available', photoUrl: '', photoUrl2: '', photoUrl3: '' });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setIsEditing(true);
    setEditId(room.id);
    setNewRoom({
      number: room.number, floor: room.floor, type: room.type || 'Standard Double Bed', priceDaily: room.priceDaily || '',
      priceMonthly: room.priceMonthly || '', status: room.status, photoUrl: room.photoUrl || '',
      photoUrl2: room.photoUrl2 || '', photoUrl3: room.photoUrl3 || ''
    });
    setShowModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const finalFormattedNumber = formatRoomNumber(newRoom.number, newRoom.floor);

    const isDuplicate = rooms.some(r => r.number === finalFormattedNumber && String(r.floor) === String(newRoom.floor) && r.id !== editId);
    if (isDuplicate) {
      showToast(`Kamar No. ${finalFormattedNumber} di Lantai ${newRoom.floor} sudah terdaftar!`, "error");
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const payload = { 
      ...newRoom, 
      number: finalFormattedNumber, 
      priceDaily: newRoom.priceDaily ? Number(newRoom.priceDaily) : null, 
      priceMonthly: newRoom.priceMonthly ? Number(newRoom.priceMonthly) : 0 
    };
    if (isEditing) payload.id = editId;

    try {
      const res = await fetch('/api/kamar', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowModal(false);
        fetchRooms(); 
        showToast(isEditing ? "Kamar berhasil diperbarui!" : "Kamar berhasil ditambahkan!", "success");
      } else showToast("Gagal menyimpan data kamar.", "error");
    } catch (error) { showToast("Gagal menghubungi server", "error"); }
  };

  const handleConfirmDelete = (id) => {
    const targetRoom = rooms.find(r => r.id === id);
    setRoomToDelete(targetRoom);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      const res = await fetch('/api/kamar', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: roomToDelete.id }) });
      if (res.ok) {
        const filesToDelete = [roomToDelete.photoUrl, roomToDelete.photoUrl2, roomToDelete.photoUrl3]
          .filter(Boolean)
          .map(url => url.split('/').pop()); 

        if (filesToDelete.length > 0) {
          await supabase.storage.from('kamar-images').remove(filesToDelete);
        }
        fetchRooms(); 
        showToast("Kamar beserta fotonya berhasil dihapus!", "success");
      } else showToast("Gagal menghapus kamar", "error");
    } catch (error) { 
      showToast("Terjadi kesalahan sistem.", "error"); 
    } finally {
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/kamar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: newStatus }) });
      if (res.ok) {
        fetchRooms(); 
        showToast("Status kamar berhasil diubah", "success");
      } else showToast("Gagal mengubah status kamar", "error");
    } catch (error) { showToast("Terjadi kesalahan jaringan", "error"); }
  };

  const toggleSelect = (id) => setSelectedRooms(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    if (selectedRooms.length === filteredRooms.length) setSelectedRooms([]);
    else setSelectedRooms(filteredRooms.map(r => r.id));
  };

  const handleBulkPhotoUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(`bulk-${field}`); 
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bulk-${Date.now()}-${field}.${fileExt}`; 
      const { error: uploadError } = await supabase.storage.from('kamar-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('kamar-images').getPublicUrl(fileName);
      setBulkData(prev => ({ ...prev, [field]: data.publicUrl }));
    } catch (error) { showToast("Gagal upload foto massal", "error"); }
    setUploadingId(null);
  };

  const handleSaveBulk = async (e) => {
    e.preventDefault();
    const payload = {};
    if (bulkData.type) payload.type = bulkData.type;
    if (bulkData.priceMonthly !== '') payload.priceMonthly = Number(bulkData.priceMonthly);
    if (bulkData.priceDaily !== '') payload.priceDaily = Number(bulkData.priceDaily);
    if (bulkData.status) payload.status = bulkData.status;
    if (bulkData.photoUrl) payload.photoUrl = bulkData.photoUrl;
    if (bulkData.photoUrl2) payload.photoUrl2 = bulkData.photoUrl2;
    if (bulkData.photoUrl3) payload.photoUrl3 = bulkData.photoUrl3;

    if (Object.keys(payload).length === 0) {
      showToast("Tidak ada data yang diisi untuk diubah.", "error");
      return;
    }

    try {
      await Promise.all(selectedRooms.map(id =>
        fetch('/api/kamar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...payload }) })
      ));
      setShowBulkModal(false);
      setSelectedRooms([]);
      setBulkData({ type: '', priceDaily: '', priceMonthly: '', status: '', photoUrl: '', photoUrl2: '', photoUrl3: '' });
      fetchRooms();
      showToast(`${selectedRooms.length} Kamar berhasil diupdate!`, "success");
    } catch (error) { showToast("Gagal menyimpan perubahan massal.", "error"); }
  };

  const handlePhotoUpload = async (roomId, e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(`${roomId}-${targetField}`); 
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${roomId}-${targetField}.${fileExt}`; 
      const { error: uploadError } = await supabase.storage.from('kamar-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('kamar-images').getPublicUrl(fileName);
      const res = await fetch('/api/kamar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: roomId, [targetField]: data.publicUrl }) });
      if (res.ok) {
        fetchRooms();
        showToast("Foto berhasil diunggah!", "success");
      }
    } catch (error) { showToast("Gagal mengunggah foto", "error"); }
    setUploadingId(null);
  };

  const handleDeletePhoto = async (roomId, targetField) => {
    if(!confirm("Yakin ingin menghapus foto ini dari database?")) return;
    
    const targetRoom = rooms.find(r => r.id === roomId);
    const urlToDelete = targetRoom[targetField];

    try {
      const res = await fetch('/api/kamar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: roomId, [targetField]: "" }) });
      if (res.ok) {
        if (urlToDelete) {
          const fileName = urlToDelete.split('/').pop();
          await supabase.storage.from('kamar-images').remove([fileName]);
        }
        fetchRooms(); 
        showToast("Foto berhasil dihapus!", "success");
      } else showToast("Gagal menghapus foto dari database.", "error");
    } catch (error) { showToast("Terjadi kesalahan sistem.", "error"); }
  };

  const formatRupiah = (number) => number ? "Rp " + number.toLocaleString('id-ID') : "-";

  // Filter pencarian, status, dan kategori tipe kamar (Diubah ke 3 tipe kamar)
  const filteredRooms = rooms.filter(r => {
    const matchSearch = r.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchCategory = filterCategory === 'All' || (r.type || 'Standard Double Bed') === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const PhotoSlot = ({ room, field, label }) => {
    const isUploading = uploadingId === `${room.id}-${field}`;
    const photoValue = room[field];
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
        {photoValue ? (
          <div className="relative group">
            <img src={photoValue} alt={label} className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105"/>
            <button onClick={() => handleDeletePhoto(room.id, field)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] md:text-xs font-bold hover:bg-red-600 shadow-md transition-transform active:scale-90" title="Hapus Foto">✕</button>
          </div>
        ) : (
          <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium text-center p-1">Kosong</div>
        )}
        <label className={`cursor-pointer text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 select-none ${isUploading ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 pointer-events-none' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white'}`}>
          {isUploading ? 'Tunggu...' : (photoValue ? 'Ganti' : 'Isi Foto')}
          <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(room.id, e, field)} className="hidden" />
        </label>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-12 transition-colors duration-300">
        <div className="px-4 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
          <div className="w-32 h-10 md:h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-12 max-w-7xl mx-auto space-y-3">
          <div className="w-48 md:w-80 h-10 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          <div className="w-64 md:w-96 h-5 md:h-6 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="px-4 md:px-10 max-w-7xl mx-auto">
          {/* Skeleton Layout untuk bagian Filter/Search terbaru (3 Input) */}
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto mb-6">
            <div className="w-full md:w-64 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="w-full md:w-44 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="w-full md:w-44 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          </div>
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="w-full h-8 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center w-full">
                  <div className="w-1/4 space-y-2"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="w-1/4 space-y-2"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div></div>
                  <div className="w-1/4 space-y-2"><div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="w-1/4 flex justify-center gap-2"><div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div><div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-32 transition-colors duration-300 animate-fade-in relative">
      
      <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl ${isAnimateReady ? 'transition-all duration-500 ease-out' : ''} ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'} ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-rose-600 text-white'}`}>
        <div className="bg-white/20 p-1 rounded-full">
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>
        <span className="font-bold text-sm md:text-base">{toast.message}</span>
      </div>

      {selectedRooms.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 md:px-8 py-4 rounded-2xl md:rounded-full shadow-2xl flex flex-wrap items-center justify-center gap-3 md:gap-5 z-40 animate-slide-up border border-gray-700 dark:border-gray-200 w-[90%] md:w-auto">
          <span className="font-black text-sm md:text-base w-full md:w-auto text-center">{selectedRooms.length} Kamar Terpilih</span>
          <button onClick={() => setShowBulkModal(true)} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-95 text-xs md:text-sm">
            ⚙️ Edit Sekaligus
          </button>
          <button onClick={() => setSelectedRooms([])} className="flex-1 md:flex-none bg-gray-700 dark:bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-300 text-white dark:text-gray-800 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-95 text-xs md:text-sm">
            Batal
          </button>
        </div>
      )}

      <button onClick={openAddModal} className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-3xl font-bold z-50 transition-all duration-200 active:scale-90 ${isAnimateReady ? 'transition-all duration-500 ease-out' : ''} ${showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`} title="Tambah Kamar Baru">
        +
      </button>

      <div className="px-4 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all duration-300 active:scale-95 select-none bg-white dark:bg-gray-800 px-3 py-2 md:px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm md:text-base" draggable={false} href="/admin/dashboard">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg> Dashboard
        </Link>
        <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-90">
          {theme === 'light' ? <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
        </button>
      </div>

      <div className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Kamar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 md:mt-3 text-sm md:text-lg">Unggah foto fasilitas, atur kategori tipe kamar, dan pantau status ketersediaan.</p>
        </div>
        <button ref={topButtonRef} onClick={openAddModal} className="w-full md:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl md:rounded-full shadow-md transition-all active:scale-95 select-none flex items-center gap-2 text-sm md:text-base">
          <span>+</span> Tambah Kamar Baru
        </button>
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto">

        {/* SEARCH, FILTER STATUS & FILTER KATEGORI */}
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto mb-6">
          <div className="relative w-full md:w-64">
            <input type="text" placeholder="Cari No. Kamar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2.5 pl-10 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-sm"/>
            <svg className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          {/* Sorting / Filter Kategori */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl font-medium outline-none cursor-pointer shadow-sm text-sm">
            <option value="All">Semua Kategori</option>
            <option value="Standard Double Bed">Standard Double Bed</option>
            <option value="Standard Twin Bed">Standard Twin Bed</option>
            <option value="Family Room">Family Room</option>
          </select>

          {/* Sorting / Filter Status */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl font-medium outline-none cursor-pointer shadow-sm text-sm">
            <option value="All">Semua Status</option>
            <option value="Available">Tersedia</option>
            <option value="Booked">Dipesan</option>
            <option value="Renovation">Renovasi</option>
            <option value="Not Available">Tidak Tersedia</option>
          </select>
        </div>

        {filteredRooms.length === 0 && rooms.length > 0 && (
          <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 rounded-2xl mb-4 font-medium border border-yellow-100 dark:border-yellow-900/30">
            Tidak ada kamar yang sesuai dengan pencarian Anda.
          </div>
        )}

        {/* MOBILE CARDS */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="flex items-center gap-3 px-1 mb-2">
            <input type="checkbox" onChange={toggleSelectAll} checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0} className="w-5 h-5 accent-blue-600 rounded border-gray-300"/>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Pilih Semua Kamar</span>
          </div>
          
          {filteredRooms.map((room) => (
            <div key={room.id} className={`bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border ${selectedRooms.includes(room.id) ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-gray-700'} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="pt-1">
                    <input type="checkbox" checked={selectedRooms.includes(room.id)} onChange={() => toggleSelect(room.id)} className="w-5 h-5 accent-blue-600 rounded border-gray-300 cursor-pointer"/>
                  </div>
                  <div>
                    <div className="font-black text-3xl text-gray-800 dark:text-gray-100 leading-none">{room.number}</div>
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Lantai {room.floor} • <span className="text-blue-600 dark:text-blue-400 font-bold">{room.type || 'Standard Double Bed'}</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-28">
                  <select value={room.status} onChange={(e) => handleStatusChange(room.id, e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold p-2 rounded-lg outline-none cursor-pointer">
                    <option value="Available">🟩 Tersedia</option>
                    <option value="Booked">🟨 Dipesan</option>
                    <option value="Renovation">🟥 Renovasi</option>
                    <option value="Not Available">⬛ Tidak Tersedia</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl mb-5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Bulanan</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {room.priceMonthly > 0 ? formatRupiah(room.priceMonthly) : "-"}
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Harian</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatRupiah(room.priceDaily)}</span>
                </div>
              </div>

              <div className="mb-5 flex justify-between gap-2">
                <PhotoSlot field="photoUrl" label="Utama" room={room}/>
                <PhotoSlot field="photoUrl2" label="K. Mandi" room={room}/>
                <PhotoSlot field="photoUrl3" label="Lainnya" room={room}/>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEditModal(room)} title="Edit Kamar" className="flex-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 p-3 rounded-xl flex items-center justify-center transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onClick={() => handleConfirmDelete(room.id)} title="Hapus Kamar" className="flex-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 p-3 rounded-xl flex items-center justify-center transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-5 w-16 text-center">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0} className="w-5 h-5 accent-blue-600 rounded border-gray-300 cursor-pointer"/>
                  </th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Foto Fasilitas</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Identitas & Kategori</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Harga Sewa</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredRooms.map(room => (
                  <tr key={room.id} className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${selectedRooms.includes(room.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <td className="p-5 text-center">
                      <input type="checkbox" checked={selectedRooms.includes(room.id)} onChange={() => toggleSelect(room.id)} className="w-5 h-5 accent-blue-600 rounded border-gray-300 cursor-pointer"/>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-4">
                        <PhotoSlot field="photoUrl" label="Utama" room={room}/>
                        <PhotoSlot field="photoUrl2" label="K. Mandi" room={room}/>
                        <PhotoSlot field="photoUrl3" label="Lainnya" room={room}/>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-2xl text-gray-800 dark:text-gray-100">{room.number}</div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Lantai {room.floor}</div>
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-md inline-block">{room.type || 'Standard Double Bed'}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {room.priceMonthly > 0 ? formatRupiah(room.priceMonthly) : "-"} <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{room.priceMonthly > 0 ? "/bln" : ""}</span>
                      </div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(room.priceDaily)} <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">/hr</span></div>
                    </td>
                    <td className="p-5">
                      <select value={room.status} onChange={(e) => handleStatusChange(room.id, e.target.value)} className="w-full max-w-[150px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold p-2.5 rounded-xl outline-none cursor-pointer">
                        <option value="Available">🟩 Tersedia</option>
                        <option value="Booked">🟨 Dipesan</option>
                        <option value="Renovation">🟥 Renovasi</option>
                        <option value="Not Available">⬛ Tidak Tersedia</option>
                      </select>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(room)} title="Edit Kamar" className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl transition-all active:scale-95 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleConfirmDelete(room.id)} title="Hapus Kamar" className="bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl transition-all active:scale-95 shadow-sm">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT INDIVIDUAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="p-5 md:p-8 flex-shrink-0 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Kamar' : 'Tambah Kamar'}</h2>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition-all active:scale-90">✕</button>
            </div>
            <div className="p-5 md:p-8">
              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">No. Kamar</label>
                    <input type="text" required value={newRoom.number} onChange={handleNumberChange} onBlur={handleNumberBlur} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base" placeholder="101"/>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Lantai</label>
                    <select value={newRoom.floor} onChange={handleFloorChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base cursor-pointer">
                      <option value="1">Lantai 1</option>
                      <option value="2">Lantai 2</option>
                      <option value="3">Lantai 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Kategori / Tipe Kamar</label>
                  <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base cursor-pointer">
                    <option value="Standard Double Bed">Standard Double Bed</option>
                    <option value="Standard Twin Bed">Standard Twin Bed</option>
                    <option value="Family Room">Family Room</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Harga Bulanan (Rp)</label>
                    <input type="number" value={newRoom.priceMonthly} onChange={(e) => setNewRoom({...newRoom, priceMonthly: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base" placeholder="1500000"/>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Harga Harian (Rp)</label>
                    <input type="number" value={newRoom.priceDaily} onChange={(e) => setNewRoom({...newRoom, priceDaily: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base" placeholder="150000"/>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all active:scale-95 shadow-md text-base md:text-lg">
                    {isEditing ? 'Simpan Perubahan' : 'Simpan Kamar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT MASSAL (BULK EDIT) */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-5 md:p-8 flex-shrink-0 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-blue-700 dark:text-blue-400">Edit {selectedRooms.length} Kamar Sekaligus</h2>
                <p className="text-xs font-bold text-blue-500 dark:text-blue-300 mt-1">Hanya kolom yang diisi yang akan diubah.</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition-all shadow-sm active:scale-90">✕</button>
            </div>
            
            <div className="p-5 md:p-8 overflow-y-auto">
              <form onSubmit={handleSaveBulk} className="space-y-6">
                
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Ubah Kategori / Tipe Kamar</label>
                  <select value={bulkData.type} onChange={(e) => setBulkData({...bulkData, type: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold p-3 rounded-xl outline-none cursor-pointer text-sm">
                    <option value="">-- Jangan Ubah Tipe --</option>
                    <option value="Standard Double Bed">Standard Double Bed</option>
                    <option value="Standard Twin Bed">Standard Twin Bed</option>
                    <option value="Family Room">Family Room</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Ubah Harga Bulanan</label>
                    <input type="number" value={bulkData.priceMonthly} onChange={(e) => setBulkData({...bulkData, priceMonthly: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl outline-none font-medium text-sm" placeholder="(Biarkan Kosong)"/>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Ubah Harga Harian</label>
                    <input type="number" value={bulkData.priceDaily} onChange={(e) => setBulkData({...bulkData, priceDaily: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl outline-none font-medium text-sm" placeholder="(Biarkan Kosong)"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 leading-tight">Ubah Status</label>
                  <select value={bulkData.status} onChange={(e) => setBulkData({...bulkData, status: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold p-3 rounded-xl outline-none cursor-pointer text-sm">
                    <option value="">-- Jangan Ubah Status --</option>
                    <option value="Available">🟩 Tersedia</option>
                    <option value="Booked">🟨 Dipesan</option>
                    <option value="Renovation">🟥 Renovasi</option>
                    <option value="Not Available">⬛ Tidak Tersedia</option>
                  </select>
                </div>

                <div className="pt-4 mt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all active:scale-95 shadow-md text-base md:text-lg">
                    Simpan Perubahan Massal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kamar */}
      {isDeleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Hapus Kamar {roomToDelete.number}?</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Anda akan menghapus data kamar <strong className="text-gray-800 dark:text-gray-200">{roomToDelete.number}</strong> (Lantai {roomToDelete.floor}). Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl text-sm transition-all active:scale-95">
                Batal
              </button>
              <button onClick={executeDeleteRoom} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/25 transition-all active:scale-95">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}