import { NextResponse } from 'next/server';
import { db } from '../../../lib/db'; 

export async function GET() {
  try {
    const rooms = await db.room.findMany({
      orderBy: { number: 'asc' } 
    }); 
    return NextResponse.json(rooms);
  } catch (error) {
    console.log("ERROR GET:", error);
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newRoom = await db.room.create({
      data: {
        number: body.number,
        floor: body.floor,
        // Menyimpan dua jenis harga
        priceDaily: body.priceDaily ? Number(body.priceDaily) : null,
        priceMonthly: Number(body.priceMonthly),
        status: body.status,
        photoUrl: body.photoUrl || "",
        photoUrl2: body.photoUrl2 || "", 
        photoUrl3: body.photoUrl3 || ""  
      }
    });
    return NextResponse.json(newRoom);
  } catch (error) {
    console.log("ERROR POST:", error);
    return NextResponse.json({ error: "Gagal menambah kamar" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    const updateData = {};
    
    // PERBAIKAN: Izinkan backend menerima update nomor dan lantai
    if (body.number) updateData.number = body.number;
    if (body.floor) updateData.floor = body.floor;
    
    if (body.status) updateData.status = body.status;
    
    // Update harga jika ada perubahan
    if (body.priceDaily !== undefined) {
      updateData.priceDaily = body.priceDaily ? Number(body.priceDaily) : null;
    }
    if (body.priceMonthly !== undefined) {
      updateData.priceMonthly = Number(body.priceMonthly);
    }

    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl;
    if (body.photoUrl2 !== undefined) updateData.photoUrl2 = body.photoUrl2; 
    if (body.photoUrl3 !== undefined) updateData.photoUrl3 = body.photoUrl3; 

    const updatedRoom = await db.room.update({
      where: { id: Number(body.id) },
      data: updateData
    });
    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.log("ERROR PUT:", error);
    // Jika error karena nomor kamar ganda, Prisma akan melempar error P2002
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Nomor kamar sudah terpakai di lantai ini" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mengupdate kamar" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    await db.room.delete({
      where: { id: Number(body.id) } 
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("ERROR DELETE:", error);
    return NextResponse.json({ error: "Gagal menghapus kamar" }, { status: 500 });
  }
}