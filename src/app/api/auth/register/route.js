import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Inisialisasi Prisma standar yang bersih dari driver adapter
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  try {
    // Perbaikan: Hapus confirmPassword karena tidak dikirim dari frontend
    const { username, password, secretCode, websiteUrl } = await request.json();

    // 0. JEBAKAN BOT (Honeypot): Kirim respons 201 seolah-olah berhasil, TANPA menyimpan data ke database
    if (websiteUrl) {
      return NextResponse.json(
        { message: 'Registrasi berhasil!', username: 'admin' },
        { status: 201 }
      );
    }

    // 1. Validasi input tidak boleh kosong (Sekarang mengecek username, password, dan secretCode)
    if (!username || !password || !secretCode) {
      return NextResponse.json({ error: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    // 2. Validasi Kode Rahasia untuk mencegah Bot/Hijacking registrasi
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Kode Rahasia Pendaftaran salah!' }, { status: 403 });
    }

    // 3. Validasi kekuatan password (min 8 karakter, huruf besar, kecil, angka, dan simbol)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter dan harus mengandung kombinasi huruf besar, huruf kecil, angka, serta simbol.' },
        { status: 400 }
      );
    }

    // 4. Cek apakah username sudah terdaftar di tabel Admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Username sudah digunakan oleh admin lain.' }, { status: 400 });
    }

    // 5. Enkripsi password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Simpan admin baru ke database
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