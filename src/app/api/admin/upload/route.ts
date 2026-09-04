import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';
import { ensureUploadsDir } from '@/lib/storage';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const ext = (path.extname(file.name) || '.jpg').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, WEBP, GIF, and SVG images are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamped name
    const rawBase = path.basename(file.name, ext);
    const base = rawBase.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'product';
    const filename = `${base}-${Date.now()}${ext}`;

    const uploadsDir = await ensureUploadsDir();
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // If writing to /data/uploads on Railway, also attempt to copy to public/uploads if accessible
    const localPublicUploads = path.join(process.cwd(), 'public', 'uploads');
    if (uploadsDir !== localPublicUploads) {
      try {
        await writeFile(path.join(localPublicUploads, filename), buffer);
      } catch {
        // Not critical if public/uploads is read-only or doesn't exist
      }
    }

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
