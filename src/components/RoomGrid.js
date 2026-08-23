'use client'; 

export default function RoomGrid({ rooms = [], onRoomClick }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': 
        return 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100 hover:-translate-y-0.5 cursor-pointer shadow-sm hover:shadow-md'; 
      case 'Booked': 
        return 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed opacity-90'; 
      case 'Renovation': 
        return 'bg-rose-50 border-rose-300 text-rose-700 cursor-not-allowed opacity-90'; 
      default: 
        return 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed opacity-90'; 
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return '✓ Tersedia';
      case 'Booked': return '🔒 Terisi';
      case 'Renovation': return '🛠️ Renovasi';
      default: return '✕ Tidak Tersedia';
    }
  };

  if (!Array.isArray(rooms)) {
    return (
      <div className="p-8 text-center text-red-500 border border-red-200 bg-red-50 rounded-xl">
        Terjadi gangguan saat memuat denah kamar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => room.status === 'Available' ? onRoomClick(room) : null}
          className={`border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition-all overflow-hidden ${getStatusStyle(room.status)}`}
        >
          {/* BAGIAN FOTO KAMAR */}
          {room.photoUrl && room.photoUrl !== "" ? (
            <img 
              src={room.photoUrl} 
              alt={`Kamar ${room.number}`} 
              className="w-full h-28 object-cover rounded-lg mb-3 shadow-sm"
            />
          ) : (
            <div className="w-full h-28 bg-white/60 rounded-lg mb-3 flex items-center justify-center text-xs font-medium opacity-60">
              📷 Tanpa Foto
            </div>
          )}
          
          <span className="text-2xl font-black mb-1">{room.number}</span>
          <span className="text-xs font-bold">{getStatusIcon(room.status)}</span>
        </button>
      ))}
    </div>
  );
}