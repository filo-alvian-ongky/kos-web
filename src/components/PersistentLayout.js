'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PersistentLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  if (!mounted) return null;

  // Jika masuk ke halaman Admin, HILANGKAN Navbar & Footer Publik
  if (isAdmin) {
    return <div className="transition-colors duration-300">{children}</div>;
  }

  // Jika di halaman Pengguna (Publik), TAMPILKAN Navbar & Footer secara permanen
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 overflow-x-hidden">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow pt-24 pb-8 md:pt-32 md:pb-12 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}