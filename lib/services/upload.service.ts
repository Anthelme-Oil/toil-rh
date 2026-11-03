
type UploadProgressCallback = (progress: number) => void;

interface UploadResponse {
  url?: string;
  error?: string;
  message?: string;
}

export const uploadClientService = {
  async uploadFile(
    file: File,
    folder: string = "actualites",
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!file || file.size === 0) {
      throw new Error("Fichier vide.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "/api/saver");
      xhr.responseType = "json";
      xhr.timeout = 120000;

      onProgress?.(0);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round(
            (event.loaded / event.total) * 100
          );

          onProgress?.(progress);
        }
      };

      xhr.onload = () => {
        const data: UploadResponse =
          xhr.response ||
          (() => {
            try {
              return JSON.parse(xhr.responseText);
            } catch {
              return {};
            }
          })();

        if (xhr.status >= 200 && xhr.status < 300) {
          if (!data.url) {
            reject(
              new Error(
                "Le serveur n'a pas retourné l'URL du fichier."
              )
            );
            return;
          }

          onProgress?.(100);
          resolve(data.url);
          return;
        }

        const errors: Record<number, string> = {
          404: "Route de téléversement introuvable.",
          405: "Méthode HTTP non autorisée.",
          413: "Fichier trop volumineux.",
          500: "Erreur interne du serveur."
        };

        reject(
          new Error(
            data.error ||
            data.message ||
            errors[xhr.status] ||
            `Erreur HTTP ${xhr.status} pendant le téléversement.`
          )
        );
      };

      xhr.onerror = () => {
        reject(
          new Error("Impossible de contacter le serveur.")
        );
      };

      xhr.onabort = () => {
        reject(
          new Error("Téléversement interrompu.")
        );
      };

      xhr.ontimeout = () => {
        reject(
          new Error("Délai de téléversement dépassé.")
        );
      };

      // Ne pas définir Content-Type manuellement.
      xhr.send(formData);
    });
  }
};
