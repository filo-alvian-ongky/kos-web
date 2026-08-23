import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const contents = await prisma.siteContent.findMany();

    const settingsMap = {};
    if (Array.isArray(contents)) {
      contents.forEach(item => {
        settingsMap[item.key] = item.value;
      });
    }

    const defaultSettings = {
      kosName: 'Garuda Kostel',
      waNumber: '6281234567890',
      heroTitle: 'Kenyamanan Eksklusif di Garuda Kostel',
      heroSubtitle: 'Kostel berkonsep hotel dengan fasilitas premium.',
      address: 'Jl. Garuda No.9, Randugunting, Tegal',
      mapsLink: 'https://www.google.com/maps/embed?pb=...'
    };

    const finalSettings = { ...defaultSettings, ...settingsMap };

    return NextResponse.json(finalSettings, { status: 200 });
  } catch (error) {
    console.error("API GET Konten Error:", error);
    return NextResponse.json({
      kosName: 'Garuda Kostel',
      waNumber: '6281234567890',
      heroTitle: 'Kenyamanan Eksklusif di Garuda Kostel',
      heroSubtitle: 'Kostel berkonsep hotel dengan fasilitas premium.',
      address: 'Jl. Garuda No.9, Randugunting, Tegal',
      mapsLink: 'https://www.google.com/maps/embed?pb=...'
    }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // LOGIKA CERDAS: Jika input mapsLink berupa kode HTML iframe lengkap, ekstrak src-nya saja
    if (data.mapsLink && data.mapsLink.includes('<iframe')) {
      const match = data.mapsLink.match(/src="([^"]+)"/);
      if (match && match[1]) {
        data.mapsLink = match[1];
      }
    }

    const upsertPromises = Object.entries(data).map(([key, value]) => {
      if (key === 'id') return Promise.resolve();
      return prisma.siteContent.upsert({
        where: { key: key },
        update: { value: String(value || '') },
        create: { key: key, value: String(value || '') }
      });
    });

    await Promise.all(upsertPromises);

    const updatedContents = await prisma.siteContent.findMany();
    const updatedSettingsMap = {};
    updatedContents.forEach(item => {
      updatedSettingsMap[item.key] = item.value;
    });

    return NextResponse.json(updatedSettingsMap, { status: 200 });
  } catch (error) {
    console.error("API POST Konten Error:", error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan web' }, { status: 500 });
  }
}