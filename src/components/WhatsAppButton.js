export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/6282140464565" //nomor admin kos
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white py-3 px-4 rounded-full shadow-lg shadow-green-600/30 hover:bg-[#20bd5a] hover:-translate-y-1 transition-all z-50 flex items-center gap-2 font-bold"
    >
      <span>💬</span> Chat Admin
    </a>
  );
}