import { NextResponse } from 'next/server';
import { db } from '../../../lib/db'; 

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.log("ERROR GET BOOKING:", error);
    return NextResponse.json({ error: "Gagal mengambil data pemesanan" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);

    // 1. VALIDASI GARIS WAKTU
    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Tanggal Check-Out harus lebih besar dari tanggal Check-In." },
        { status: 400 }
      );
    }

    // 2. CEK DOUBLE BOOKING (TABRAKAN JADWAL) menggunakan startDate & endDate
    const existingBooking = await db.booking.findFirst({
      where: {
        roomNumber: body.roomNumber,
        AND: [
          { startDate: { lt: checkOut } }, 
          { endDate: { gt: checkIn } }  
        ]
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: `Kamar ${body.roomNumber} sudah terisi pada rentang tanggal tersebut.` },
        { status: 400 }
      );
    }

    // Hitung status otomatis dari split payment (Cash + Transfer)
    const total = parseFloat(body.totalAmount) || 0;
    const cash = parseFloat(body.paidCash) || 0;
    const transfer = parseFloat(body.paidTransfer) || 0;
    const computedStatus = (cash + transfer) >= total ? 'Lunas' : 'Belum Lunas';

    const newBooking = await db.booking.create({
      data: {
        roomNumber: body.roomNumber,
        tenantName: body.guestName, // Menyesuaikan schema tenantName
        totalAmount: total,
        paidCash: cash,
        paidTransfer: transfer,
        status: computedStatus,
        startDate: checkIn,   // Menyesuaikan schema startDate
        endDate: checkOut,    // Menyesuaikan schema endDate
      }
    });
    return NextResponse.json(newBooking);
  } catch (error) {
    console.log("ERROR POST BOOKING:", error);
    return NextResponse.json({ error: "Gagal membuat pemesanan" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updateData = {};
    const bookingId = Number(body.id);

    // Jika Admin mengubah kamar atau tanggal, kita wajib memvalidasi ulang
    if (body.roomNumber || body.checkInDate || body.checkOutDate) {
      
      const currentBooking = await db.booking.findUnique({ where: { id: bookingId } });
      if (!currentBooking) {
        return NextResponse.json({ error: "Data booking tidak ditemukan" }, { status: 404 });
      }

      const checkIn = body.checkInDate ? new Date(body.checkInDate) : currentBooking.startDate;
      const checkOut = body.checkOutDate ? new Date(body.checkOutDate) : currentBooking.endDate;
      const roomNumber = body.roomNumber || currentBooking.roomNumber;

      // 1. VALIDASI GARIS WAKTU
      if (checkOut <= checkIn) {
        return NextResponse.json(
          { error: "Tanggal Check-Out harus lebih besar dari tanggal Check-In." },
          { status: 400 }
        );
      }

      // 2. CEK DOUBLE BOOKING menggunakan startDate & endDate
      const existingBooking = await db.booking.findFirst({
        where: {
          roomNumber: roomNumber,
          id: { not: bookingId }, 
          AND: [
            { startDate: { lt: checkOut } },
            { endDate: { gt: checkIn } }
          ]
        }
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: `Gagal! Kamar ${roomNumber} bersinggungan dengan jadwal penyewa lain.` },
          { status: 400 }
        );
      }

      if (body.roomNumber) updateData.roomNumber = body.roomNumber;
      if (body.checkInDate) updateData.startDate = checkIn;
      if (body.checkOutDate) updateData.endDate = checkOut;
    }

    if (body.guestName) updateData.tenantName = body.guestName;
    
    // Perbarui data keuangan jika dikirimkan
    if (body.totalAmount !== undefined) {
      updateData.totalAmount = parseFloat(body.totalAmount) || 0;
    }
    if (body.paidCash !== undefined) {
      updateData.paidCash = parseFloat(body.paidCash) || 0;
    }
    if (body.paidTransfer !== undefined) {
      updateData.paidTransfer = parseFloat(body.paidTransfer) || 0;
    }

    // Hitung ulang status otomatis jika ada perubahan nominal atau status dipaksa
    const currentBookingFull = await db.booking.findUnique({ where: { id: bookingId } });
    const finalTotal = updateData.totalAmount !== undefined ? updateData.totalAmount : currentBookingFull.totalAmount;
    const finalCash = updateData.paidCash !== undefined ? updateData.paidCash : currentBookingFull.paidCash;
    const finalTransfer = updateData.paidTransfer !== undefined ? updateData.paidTransfer : currentBookingFull.paidTransfer;
    
    updateData.status = (finalCash + finalTransfer) >= finalTotal ? 'Lunas' : 'Belum Lunas';

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: updateData
    });
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.log("ERROR PUT BOOKING:", error);
    return NextResponse.json({ error: "Gagal mengupdate pemesanan" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    await db.booking.delete({
      where: { id: Number(body.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("ERROR DELETE BOOKING:", error);
    return NextResponse.json({ error: "Gagal menghapus pemesanan" }, { status: 500 });
  }
}