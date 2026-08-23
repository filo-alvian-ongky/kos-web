import './globals.css';
import PersistentLayout from '../components/PersistentLayout';

export const metadata = {
  title: 'Garuda Kostel',
  description: 'Kenyamanan Kost, Fasilitas Setara Hotel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[#f2f4f7] dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen relative antialiased transition-colors duration-300">
        <PersistentLayout>
          {children}
        </PersistentLayout>
      </body>
    </html>
  );
}