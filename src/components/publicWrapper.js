'use client';
// File ini sekarang menjadi transparan (pass-through).
// Layout sudah diambil alih sepenuhnya oleh PersistentLayout di layout.js
// Agar kamu tidak perlu repot mengedit ulang halaman Beranda, Fasilitas, Kamar, dll.

export default function PublicWrapper({ children }) {
  return <>{children}</>;
}