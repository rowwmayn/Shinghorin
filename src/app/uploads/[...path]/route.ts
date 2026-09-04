import { NextRequest, NextResponse } from 'next/server';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { resolveUploadFilePath } from '@/lib/storage';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Join path segments and sanitize
    const requestedFile = pathSegments.join('/');
    const safeFilename = path.basename(requestedFile);

    const filePath = resolveUploadFilePath(safeFilename);
    if (!filePath) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const fileBuffer = await fsPromises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
