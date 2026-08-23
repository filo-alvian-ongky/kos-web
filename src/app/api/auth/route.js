import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Inisialisasi Prisma standar yang bersih dari driver adapter
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    // Ubah nama cookie menjadi 'admin_token' agar sesuai dengan middleware Anda
    const response = NextResponse.json({ message: 'Login berhasil!', username: admin.username }, { status: 200 });
    
    response.cookies.set({
      name: 'admin_token',
      value: admin.username, // atau token acak/JWT jika ada
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;

  } catch (error) {
    console.error("API Auth Login Error:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}