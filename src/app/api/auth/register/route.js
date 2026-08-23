import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Inisialisasi Prisma standar yang bersih dari driver adapter
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  try {
    const { username, password, secretCode } = await request.json();

    // 1. Validasi Kode Rahasia untuk mencegah Bot/Hijacking registrasi
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Kode Rahasia Pendaftaran salah!' }, { status: 403 });
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // 2. Cek apakah username sudah terdaftar di tabel Admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Username sudah digunakan oleh admin lain.' }, { status: 400 });
    }

    // 3. Enkripsi password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan admin baru ke database
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Registrasi berhasil!', username: newAdmin.username }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}