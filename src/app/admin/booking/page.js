'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);
  const [roomsData, setRoomsData] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State Modal Nota / Receipt PDF
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // State Modal Konfirmasi Hapus
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State Modal Unduh CSV
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvStartDate, setCsvStartDate] = useState('');
  const [csvEndDate, setCsvEndDate] = useState('');
  
  // State Form
  const [formData, setFormData] = useState({
    roomNumber: '', guestName: '', rentType: 'Bulanan',
    paymentStatus: 'Belum Lunas', totalAmount: '', paidCash: '', paidTransfer: '',
    checkInDate: '', checkOutDate: '', notes: ''
  });

  const topActionRef = useRef(null);
  const [showFAB, setShowFAB] = useState(false);
  const [isDialOpen, setIsDialOpen] = useState(false);
  const [isAnimateReady, setIsAnimateReady] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500); 
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
      ([entry]) => {
        setShowFAB(!entry.isIntersecting);
        if (entry.isIntersecting) setIsDialOpen(false); 
      },
      { threshold: 0, rootMargin: "0px" }
    );
    if (topActionRef.current) observer.observe(topActionRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const fetchAllData = async () => {
    try {
      const [resBookings, resRooms] = await Promise.all([ fetch('/api/booking'), fetch('/api/kamar') ]);
      const dataBookings = await resBookings.json();
      const dataRooms = await resRooms.json();
      if (Array.isArray(dataBookings)) setBookings(dataBookings);
      if (Array.isArray(dataRooms)) setRoomsData(dataRooms);
    } catch (error) {
      showToast("Gagal mengambil data dari server", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'roomNumber') {
      newValue = newValue.toUpperCase();
      if (newValue.length > 0 && newValue[0] !== '0') newValue = '0' + newValue;
    }

    let updatedForm = { ...formData, [name]: newValue };

    if (name === 'checkInDate' || name === 'rentType') {
      const currentRentType = name === 'rentType' ? newValue : updatedForm.rentType;
      const currentCheckIn = name === 'checkInDate' ? newValue : updatedForm.checkInDate;
      if (currentCheckIn) {
        const inDate = new Date(currentCheckIn);
        if (currentRentType === 'Bulanan') {
          inDate.setMonth(inDate.getMonth() + 1);
          updatedForm.checkOutDate = inDate.toISOString().split('T')[0];
        } else if (currentRentType === 'Harian' && updatedForm.checkOutDate) {
          const outDate = new Date(updatedForm.checkOutDate);
          if (outDate <= new Date(currentCheckIn)) {
            inDate.setDate(inDate.getDate() + 1);
            updatedForm.checkOutDate = inDate.toISOString().split('T')[0];
          }
        }
      }
    }
    setFormData(updatedForm);
  };

  let minCheckOut = "";
  if (formData.checkInDate) {
    const inDate = new Date(formData.checkInDate);
    inDate.setDate(inDate.getDate() + (formData.rentType === 'Bulanan' ? 30 : 1)); 
    minCheckOut = inDate.toISOString().split('T')[0];
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka || 0);
  };

  const handleOpenReceipt = (booking) => {
    setSelectedBookingForReceipt(booking);
    setIsReceiptModalOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Membuka modal CSV
  const handleOpenCsvModal = () => {
    setCsvStartDate('');
    setCsvEndDate('');
    setIsCsvModalOpen(true);
    setIsDialOpen(false);
  };

  // Fungsi Eksekusi Unduh CSV berdasarkan tanggal
  const executeDownloadCSV = () => {
    let dataToDownload = bookings;

    // Filter berdasarkan rentang tanggal masuk (checkInDate) jika tanggal diisi
    if (csvStartDate && csvEndDate) {
      const start = new Date(csvStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(csvEndDate);
      end.setHours(23, 59, 59, 999);

      dataToDownload = bookings.filter(b => {
        const bStart = new Date(b.startDate || b.checkInDate);
        return bStart >= start && bStart <= end;
      });
    } else if (csvStartDate || csvEndDate) {
      showToast("Harap isi kedua tanggal (Dari & Sampai) untuk memfilter, atau kosongkan keduanya.", "error");
      return;
    }

    if (dataToDownload.length === 0) {
      showToast("Tidak ada data pesanan pada rentang tanggal tersebut.", "error");
      return;
    }

    const headers = ['No. Kamar', 'Nama Penyewa', 'Tipe Sewa', 'Total Harga', 'Bayar Cash', 'Bayar TF', 'Status Pembayaran', 'Tanggal Masuk', 'Tanggal Keluar', 'Catatan'];
    const csvRows = dataToDownload.map(b => [
      b.roomNumber, b.tenantName || b.guestName, b.rentType, b.totalAmount || 0, b.paidCash || 0, b.paidTransfer || 0, b.status || b.paymentStatus,
      new Date(b.startDate || b.checkInDate).toLocaleDateString('id-ID'),
      new Date(b.endDate || b.checkOutDate).toLocaleDateString('id-ID'),
      b.notes ? b.notes.replace(/,/g, ' ') : '' 
    ].map(field => `"${field}"`).join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const fileNameDate = csvStartDate && csvEndDate ? `${csvStartDate}_sd_${csvEndDate}` : new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Laporan_Penyewa_Kos_${fileNameDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsCsvModalOpen(false); 
    showToast("File CSV berhasil diunduh!", "success");
  };

  const openAddModal = () => {
    setFormData({ roomNumber: '', guestName: '', rentType: 'Bulanan', paymentStatus: 'Belum Lunas', totalAmount: '', paidCash: '', paidTransfer: '', checkInDate: '', checkOutDate: '', notes: '' });
    setIsEditing(false);
    setIsModalOpen(true);
    setIsDialOpen(false); 
  };

  const openEditModal = (booking) => {
    const formatDate = (isoString) => isoString ? new Date(isoString).toISOString().split('T')[0] : '';
    setFormData({
      id: booking.id, 
      roomNumber: booking.roomNumber, 
      guestName: booking.tenantName || booking.guestName || '',
      rentType: booking.rentType || 'Bulanan', 
      paymentStatus: booking.status || booking.paymentStatus || 'Belum Lunas',
      totalAmount: booking.totalAmount || '', 
      paidCash: booking.paidCash || '', 
      paidTransfer: booking.paidTransfer || '',
      checkInDate: formatDate(booking.startDate || booking.checkInDate), 
      checkOutDate: formatDate(booking.endDate || booking.checkOutDate),
      notes: booking.notes || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputRoomNumber = formData.roomNumber;
    const targetRoom = roomsData.find(r => String(r.number).toUpperCase() === inputRoomNumber);
    
    if (!targetRoom) {
      showToast(`Kamar No. ${inputRoomNumber} tidak ditemukan dalam sistem.`, "error");
      return; 
    }

    if (targetRoom.status === 'Renovation' || targetRoom.status === 'Not Available') {
      const statusIndo = targetRoom.status === 'Renovation' ? 'sedang DIRENOVASI' : 'DITUTUP';
      showToast(`Kamar ${inputRoomNumber} saat ini berstatus ${statusIndo}.`, "error");
      return; 
    }

    const total = parseFloat(formData.totalAmount) || 0;
    const cash = parseFloat(formData.paidCash) || 0;
    const transfer = parseFloat(formData.paidTransfer) || 0;
    const computedStatus = (cash + transfer) >= total ? 'Lunas' : 'Belum Lunas';

    const payload = {
      ...formData,
      totalAmount: total,
      paidCash: cash,
      paidTransfer: transfer,
      paymentStatus: computedStatus
    };

    const method = isEditing ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/booking', { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const responseData = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchAllData(); 
        showToast(`Pesanan berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}!`, "success");
      } else {
        showToast(responseData.error || "Terjadi kesalahan sistem.", "error");
      }
    } catch (error) { showToast("Gagal menghubungi server.", "error"); }
  };

  const handleConfirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!bookingToDelete) return;
    try {
      const res = await fetch('/api/booking', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bookingToDelete.id }) });
      if (res.ok) {
        fetchAllData();
        showToast("Data pesanan berhasil dihapus.", "success");
      } else {
        showToast("Gagal menghapus data.", "error");
      }
    } catch (error) { 
      showToast("Gagal menghubungi server.", "error"); 
    } finally {
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const getStatusStyle = (status) => {
    return status === 'Lunas' 
      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' 
      : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800';
  };

  const filteredBookings = bookings.filter(b => {
    const name = b.tenantName || b.guestName || '';
    const room = b.roomNumber || '';
    const bookingStatus = b.status || b.paymentStatus || '';

    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || bookingStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const modalTotal = parseFloat(formData.totalAmount) || 0;
  const modalCash = parseFloat(formData.paidCash) || 0;
  const modalTransfer = parseFloat(formData.paidTransfer) || 0;
  const modalShortage = modalTotal - (modalCash + modalTransfer);

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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
              <div className="w-full md:w-64 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              <div className="w-full md:w-36 h-11 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex w-full lg:w-auto gap-2 md:gap-3">
              <div className="flex-1 md:w-36 h-11 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl md:rounded-full animate-pulse"></div>
              <div className="flex-1 md:w-44 h-11 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-xl md:rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="w-full h-8 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center w-full">
                  <div className="w-1/5 space-y-2"><div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="w-1/5 space-y-2"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div></div>
                  <div className="w-1/5 space-y-2"><div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="w-1/5 space-y-2"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="w-1/5 flex justify-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2"><div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                  <div className="space-y-2 text-right flex flex-col items-end"><div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div><div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div></div>
                </div>
                <div className="w-full h-16 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse mb-3"></div>
                <div className="w-full h-10 bg-gray-100 dark:bg-gray-700/50 rounded-xl animate-pulse mb-4"></div>
                <div className="flex gap-2 w-full">
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] dark:bg-gray-950 font-sans pb-12 transition-colors duration-300 animate-fade-in relative">
      
      {/* Toast Notification */}
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

      {/* Floating Action Button (FAB) */}
      <div className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col-reverse items-end gap-3 z-40 ${isAnimateReady ? 'transition-all duration-500 ease-out' : ''} ${showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button onClick={() => setIsDialOpen(!isDialOpen)} className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all duration-300 active:scale-90">
          <svg className={`w-8 h-8 transition-transform duration-300 ${isDialOpen ? 'rotate-135' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
        </button>
        <div className={`flex items-center gap-3 origin-bottom ${isAnimateReady ? 'transition-all duration-300' : ''} ${isDialOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}`}>
          <span className="bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm whitespace-nowrap">Catat Pesanan</span>
          <button onClick={openAddModal} className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 w-12 h-12 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg></button>
        </div>
        <div className={`flex items-center gap-3 origin-bottom ${isAnimateReady ? 'transition-all duration-300 delay-75' : ''} ${isDialOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}`}>
          <span className="bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm whitespace-nowrap">Unduh CSV</span>
          <button onClick={handleOpenCsvModal} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 w-12 h-12 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
        </div>
      </div>

      {isDialOpen && <div onClick={() => setIsDialOpen(false)} className="fixed inset-0 z-30 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] transition-all"></div>}

      {/* Top Bar */}
      <div className="px-4 md:px-12 pt-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/admin/dashboard" draggable={false} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all duration-300 active:scale-95 select-none bg-white dark:bg-gray-800 px-3 py-2 md:px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm md:text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg> Dashboard
        </Link>
        <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-90">
          {theme === 'light' ? <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> : <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
        </button>
      </div>

      <div className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Pesanan Kos & Keuangan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 md:mt-3 text-sm md:text-lg">Kelola riwayat penyewa, pencatatan pembayaran split (Cash/TF), dan cetak nota.</p>
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto">
        <div ref={topActionRef} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-64">
              <input type="text" placeholder="Cari nama atau No. Kamar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2.5 pl-10 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors text-sm"/>
              <svg className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl font-medium outline-none cursor-pointer shadow-sm text-sm">
              <option value="All">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>

          <div className="flex w-full lg:w-auto gap-2 md:gap-3">
            <button onClick={handleOpenCsvModal} className="flex-1 md:flex-none justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 md:py-3 px-3 md:px-5 rounded-xl md:rounded-full shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm whitespace-nowrap">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Unduh CSV
            </button>
            <button onClick={openAddModal} className="flex-1 md:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 md:py-3 px-3 md:px-6 rounded-xl md:rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2 text-sm whitespace-nowrap">
              <span>+</span> Catat Pesanan
            </button>
          </div>
        </div>

        {filteredBookings.length === 0 && bookings.length > 0 && (
          <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 rounded-2xl mb-4 font-medium border border-yellow-100 dark:border-yellow-900/30">
            Tidak ada pesanan yang sesuai dengan pencarian Anda.
          </div>
        )}

        {/* Tampilan Mobile Cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {filteredBookings.map((booking) => {
            const total = booking.totalAmount || 0;
            const cash = booking.paidCash || 0;
            const transfer = booking.paidTransfer || 0;
            const shortage = total - (cash + transfer);
            const statusVal = booking.status || booking.paymentStatus || 'Belum Lunas';
            const nameVal = booking.tenantName || booking.guestName || '-';

            return (
              <div key={booking.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
                  <div>
                    <div className="font-black text-2xl text-gray-800 dark:text-gray-100 leading-none mb-1">{booking.roomNumber}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{nameVal}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{booking.rentType}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${getStatusStyle(statusVal)}`}>
                      {statusVal}
                    </span>
                  </div>
                </div>

                {/* Rincian Keuangan Mobile */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl mb-3 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200">
                    <span>Total:</span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Cash / TF:</span>
                    <span>{formatRupiah(cash)} / {formatRupiah(transfer)}</span>
                  </div>
                  {shortage > 0 && (
                    <div className="flex justify-between font-bold text-rose-500 pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span>Kurang:</span>
                      <span>{formatRupiah(shortage)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                  <div><span className="block text-gray-400 text-[10px] uppercase">Masuk</span>{new Date(booking.startDate || booking.checkInDate).toLocaleDateString('id-ID')}</div>
                  <div className="text-right"><span className="block text-gray-400 text-[10px] uppercase">Keluar</span>{new Date(booking.endDate || booking.checkOutDate).toLocaleDateString('id-ID')}</div>
                </div>

                {/* Tombol Aksi Ikon Vector (Mobile) */}
                <div className="flex gap-2">
                  <button onClick={() => handleOpenReceipt(booking)} title="Nota Pembayaran" className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </button>
                  <button onClick={() => openEditModal(booking)} title="Edit Pesanan" className="flex-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button onClick={() => handleConfirmDelete(booking)} title="Hapus Pesanan" className="flex-1 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            );
          })}
          {bookings.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl text-gray-400 font-medium text-sm border border-gray-100 dark:border-gray-700">Belum ada pesanan terdaftar.</div>
          )}
        </div>

        {/* Tampilan Desktop Table */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kamar & Nama</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipe & Status</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rincian Pembayaran</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Durasi Singgah</th>
                  <th className="p-5 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredBookings.map((booking) => {
                  const total = booking.totalAmount || 0;
                  const cash = booking.paidCash || 0;
                  const transfer = booking.paidTransfer || 0;
                  const shortage = total - (cash + transfer);
                  const statusVal = booking.status || booking.paymentStatus || 'Belum Lunas';
                  const nameVal = booking.tenantName || booking.guestName || '-';

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-5">
                        <div className="font-black text-xl text-gray-800 dark:text-gray-100">{booking.roomNumber}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{nameVal}</div>
                      </td>
                      <td className="p-5">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{booking.rentType}</div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyle(statusVal)}`}>{statusVal}</span>
                      </td>
                      <td className="p-5">
                        <div className="text-sm font-black text-gray-900 dark:text-white">Total: {formatRupiah(total)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Cash: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatRupiah(cash)}</span> | TF: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatRupiah(transfer)}</span>
                        </div>
                        {shortage > 0 && (
                          <div className="text-xs font-bold text-rose-500 mt-1">
                            Kurang: {formatRupiah(shortage)}
                          </div>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Masuk: <span className="font-normal text-gray-500">{new Date(booking.startDate || booking.checkInDate).toLocaleDateString('id-ID')}</span></div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Keluar: <span className="font-normal text-gray-500">{new Date(booking.endDate || booking.checkOutDate).toLocaleDateString('id-ID')}</span></div>
                      </td>
                      <td className="p-5 text-center">
                        {/* Tombol Aksi Ikon Vector (Desktop) */}
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenReceipt(booking)} title="Nota Pembayaran" className="bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          </button>
                          <button onClick={() => openEditModal(booking)} title="Edit Pesanan" className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button onClick={() => handleConfirmDelete(booking)} title="Hapus Pesanan" className="bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">Belum ada data pesanan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Unduh CSV dengan Filter Tanggal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Unduh Laporan CSV</h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition-all duration-200 active:scale-95">✕</button>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6">Pilih rentang tanggal masuk (Check-In) pesanan yang ingin diunduh. Kosongkan untuk mengunduh semua data.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Dari Tanggal</label>
                <input type="date" value={csvStartDate} onChange={(e) => setCsvStartDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-colors [color-scheme:light] dark:[color-scheme:dark]"/>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
                <input type="date" value={csvEndDate} onChange={(e) => setCsvEndDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-colors [color-scheme:light] dark:[color-scheme:dark]"/>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsCsvModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl text-sm transition-all duration-200 active:scale-95">Batal</button>
              <button onClick={executeDownloadCSV} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Unduh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Pesanan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-3 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2rem] md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="p-5 md:p-8 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Pesanan & Keuangan' : 'Pesanan Baru & Keuangan'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 transition-all duration-200 active:scale-95">✕</button>
              </div>
            </div>

            <div className="p-5 md:p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">No. Kamar</label>
                    <input type="text" name="roomNumber" required value={formData.roomNumber} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base" placeholder="01"/>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nama Penyewa</label>
                    <input type="text" name="guestName" required value={formData.guestName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tipe Sewa</label>
                    <select name="rentType" value={formData.rentType} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base cursor-pointer">
                      <option value="Harian">Harian</option>
                      <option value="Bulanan">Bulanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Total Harga Sewa (Rp)</label>
                    <input type="number" name="totalAmount" required value={formData.totalAmount} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base" placeholder="1500000"/>
                  </div>
                </div>

                {/* Bagian Split Payment & Indikator Kekurangan Real-time */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Bayar Tunai (Cash)</label>
                      <input type="number" name="paidCash" value={formData.paidCash} onChange={handleInputChange} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl font-bold text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="0"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Bayar Transfer</label>
                      <input type="number" name="paidTransfer" value={formData.paidTransfer} onChange={handleInputChange} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl font-bold text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="0"/>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500 dark:text-gray-400">Sisa Kekurangan:</span>
                    <span className={modalShortage > 0 ? "text-rose-500 font-black text-sm" : "text-emerald-500 font-black text-sm"}>
                      {modalShortage > 0 ? formatRupiah(modalShortage) : 'Lunas (Rp 0)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 items-end">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Check-In</label>
                    <input type="date" name="checkInDate" required value={formData.checkInDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base [color-scheme:light] dark:[color-scheme:dark]"/>
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Check-Out</label>
                    <input type="date" name="checkOutDate" required min={minCheckOut} value={formData.checkOutDate} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base [color-scheme:light] dark:[color-scheme:dark]"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Catatan (Opsional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-3 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm md:text-base" placeholder="Catatan tambahan..."></textarea>
                </div>

                <div className="pt-4 mt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-200 active:scale-95 shadow-md select-none text-base md:text-lg">
                    {isEditing ? 'Simpan Perubahan' : 'Buat Pesanan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Nota / Bukti Pembayaran */}
      {isReceiptModalOpen && selectedBookingForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 relative border border-gray-100 dark:border-gray-800">
            
            <button 
              onClick={() => setIsReceiptModalOpen(false)} 
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold print:hidden transition-all duration-200 active:scale-90"
            >
              ✕
            </button>

            <div id="printable-receipt" className="space-y-4 text-gray-800 dark:text-gray-100">
              <div className="text-center border-b border-dashed border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-black tracking-tight text-blue-600">GARUDA KOSTEL</h3>
                <p className="text-xs text-gray-400">Bukti Pembayaran / Sewa Kamar Resmi</p>
              </div>

              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nama Penyewa:</span>
                  <span className="font-bold">{selectedBookingForReceipt.tenantName || selectedBookingForReceipt.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nomor Kamar:</span>
                  <span className="font-bold">Kamar {selectedBookingForReceipt.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipe Sewa:</span>
                  <span className="font-semibold">{selectedBookingForReceipt.rentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Periode:</span>
                  <span className="font-semibold text-xs">
                    {new Date(selectedBookingForReceipt.startDate || selectedBookingForReceipt.checkInDate).toLocaleDateString('id-ID')} s/d {new Date(selectedBookingForReceipt.endDate || selectedBookingForReceipt.checkOutDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 dark:border-gray-800 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(selectedBookingForReceipt.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Bayar Tunai (Cash):</span>
                  <span>{formatRupiah(selectedBookingForReceipt.paidCash)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Bayar Transfer:</span>
                  <span>{formatRupiah(selectedBookingForReceipt.paidTransfer)}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2 text-blue-600 dark:text-blue-400">
                  <span>Status:</span>
                  <span>{selectedBookingForReceipt.status || selectedBookingForReceipt.paymentStatus}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 pt-2">
                <p>Terima kasih telah mempercayakan akomodasi Anda di Garuda Kostel.</p>
                <p>Dokumen ini sah dicetak secara digital oleh sistem.</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 print:hidden">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl text-sm transition-all duration-200 active:scale-95"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Cetak / Simpan PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Pop-up Konfirmasi Hapus */}
      {isDeleteModalOpen && bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 text-center border border-gray-100 dark:border-gray-700">
            
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Hapus Data Pesanan?</h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Anda akan menghapus data pesanan untuk penyewa <strong className="text-gray-800 dark:text-gray-200">{bookingToDelete.tenantName || bookingToDelete.guestName}</strong> di Kamar <strong className="text-gray-800 dark:text-gray-200">{bookingToDelete.roomNumber}</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-2xl text-sm transition-all duration-200 active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/25 transition-all duration-200 active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}