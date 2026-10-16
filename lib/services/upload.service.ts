// export const uploadClientService = {
//   async uploadFile(file: File, folder: string = 'actualites'): Promise<string> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('folder', folder);

//     const response = await fetch('/api/saver', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || 'Impossible d’effectuer le téléversement.');
//     }

//     return data.url;
//   },
// };

// services/uploadClientService.ts
// services/uploadClientService.ts
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_RETRIES = 3;

export const uploadClientService = {
  async uploadFile(
    file: File,
    folder: string = 'actualites',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    if (file.size === 0) throw new Error('Fichier vide.');

    const uploadId = crypto.randomUUID();
    let offset = 0;

    while (offset < file.size) {
      const end = Math.min(offset + CHUNK_SIZE, file.size);
      const chunk = file.slice(offset, end);

      let attempt = 0;
      while (true) {
        try {
          const res = await fetch('/api/saver', {
            method: 'POST',
            headers: {
              'x-upload-id': uploadId,
              'x-file-name': encodeURIComponent(file.name),
              'x-folder': folder,
              'x-offset': String(offset),
              'x-total-size': String(file.size),
              'Content-Type': 'application/octet-stream',
            },
            body: chunk,
          });

          const data = await res.json();

          // Désynchronisation : on reprend là où le serveur en est
          if (res.status === 409 && typeof data.received === 'number') {
            offset = data.received;
            break;
          }
          if (!res.ok) throw new Error(data.error || 'Impossible d’effectuer le téléversement.');

          offset = end;
          onProgress?.(Math.round((offset / file.size) * 100));

          if (data.done) return data.url as string;
          break;
        } catch (err) {
          if (++attempt >= MAX_RETRIES) throw err;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    throw new Error("L'upload s'est terminé sans URL.");
  },
};