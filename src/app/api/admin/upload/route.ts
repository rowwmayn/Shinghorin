import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamped name
    const ext = path.extname(file.name) || '.jpg';
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'product';
    const filename = `${base}-${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
