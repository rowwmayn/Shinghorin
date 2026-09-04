import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

/**
 * Determines the primary directory where uploaded product files should be saved.
 * Priority:
 * 1. UPLOAD_DIR environment variable (if explicitly set)
 * 2. /data/uploads (if /data exists, which is Railway's persistent volume mount point)
 * 3. <projectRoot>/public/uploads (local development fallback)
 */
export function getUploadsDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }

  // Check if /data volume directory exists on Linux/Railway container
  try {
    if (fs.existsSync('/data')) {
      return '/data/uploads';
    }
  } catch {
    // ignore access/permission error
  }

  return path.join(process.cwd(), 'public', 'uploads');
}

/**
 * Ensures the upload directory exists, creating parent folders recursively if necessary.
 */
export async function ensureUploadsDir(): Promise<string> {
  const dir = getUploadsDir();
  await fsPromises.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Searches all candidate storage directories to locate an uploaded file.
 * Returns the absolute path if found, or null if not found.
 */
export function resolveUploadFilePath(filename: string): string | null {
  // Sanitize filename to prevent directory traversal attacks
  const safeFilename = path.basename(filename);

  const candidateDirs: string[] = [];

  if (process.env.UPLOAD_DIR) {
    candidateDirs.push(process.env.UPLOAD_DIR);
  }

  candidateDirs.push('/data/uploads');
  candidateDirs.push(path.join(process.cwd(), 'public', 'uploads'));
  candidateDirs.push(path.join(process.cwd(), 'uploads'));

  for (const dir of candidateDirs) {
    try {
      const fullPath = path.join(dir, safeFilename);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          return fullPath;
        }
      }
    } catch {
      // Continue checking next candidate directory
    }
  }

  return null;
}
