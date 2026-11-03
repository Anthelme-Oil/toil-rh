// app/uploads/[...path]/route.ts
import { NextRequest } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const base = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(base, ...segments);

    // Empêche de sortir de public/uploads
    if (!filePath.startsWith(base + path.sep)) {
      return new Response('Interdit', { status: 403 });
    }

    let size: number;
    try {
      const st = await stat(filePath);
      if (!st.isFile()) throw new Error();
      size = st.size;
    } catch {
      return new Response('Fichier non trouvé', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers: Record<string, string> = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };

    // Les SVG peuvent contenir du JS : on les sandboxe
    if (ext === '.svg') {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }

    const range = req.headers.get('range');

    // --- Lecture partielle (vidéos, gros fichiers) ---
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m || (m[1] === '' && m[2] === '')) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      }

      let start: number;
      let end: number;
      if (m[1] === '') {
        start = Math.max(size - Number(m[2]), 0);
        end = size - 1;
      } else {
        start = Number(m[1]);
        end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      }

      if (start >= size || start > end) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      }

      const stream = createReadStream(filePath, { start, end });
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          ...headers,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': String(end - start + 1),
        },
      });
    }

    // --- Lecture complète en streaming ---
    const stream = createReadStream(filePath);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: { ...headers, 'Content-Length': String(size) },
    });
  } catch (error) {
    console.error('[API Uploads] Erreur lecture fichier:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}