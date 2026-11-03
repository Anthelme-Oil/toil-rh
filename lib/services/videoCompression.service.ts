import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  StreamTarget,
} from "mediabunny";

export type ProgressCallback = (progress: number) => void;

export interface CompressVideoOptions {
  /** Hauteur maximale de sortie (jamais d'agrandissement). */
  maxHeight?: number;
  /** En dessous de cette taille, on n'essaie pas de compresser. */
  skipBelowBytes?: number;
  /** Permet d'annuler la compression. */
  signal?: AbortSignal;
  onProgress?: ProgressCallback;
}

export interface CompressionResult {
  /** Fichier à envoyer (compressé, ou original si la compression n'apporte rien). */
  file: File;
  /** À appeler APRÈS l'upload pour libérer le fichier temporaire. Sans danger si appelé plusieurs fois. */
  cleanup: () => Promise<void>;
  originalSize: number;
  finalSize: number;
  /** true si le fichier original a été conservé. */
  skipped: boolean;
}

const DEFAULT_MAX_HEIGHT = 720;
const DEFAULT_SKIP_BELOW_BYTES = 5 * 1024 * 1024; // 5 Mo

const noop = async () => {};

/** OPFS avec écriture en flux : disponible surtout sur Chrome / Edge. */
async function getOpfsDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.getDirectory) {
      return null;
    }
    const dir = await navigator.storage.getDirectory();

    // Safari expose OPFS mais pas createWritable() sur le thread principal.
    if (
      typeof FileSystemFileHandle === "undefined" ||
      !("createWritable" in FileSystemFileHandle.prototype)
    ) {
      return null;
    }
    return dir;
  } catch {
    return null;
  }
}

export async function compressVideo(
  file: File,
  options: CompressVideoOptions = {}
): Promise<CompressionResult> {
  const {
    maxHeight = DEFAULT_MAX_HEIGHT,
    skipBelowBytes = DEFAULT_SKIP_BELOW_BYTES,
    signal,
    onProgress,
  } = options;

  // ---------- Validations ----------
  if (!file || file.size === 0) {
    throw new Error("Le fichier vidéo est vide.");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Le fichier sélectionné n'est pas une vidéo.");
  }

  if (typeof VideoEncoder === "undefined" || typeof VideoDecoder === "undefined") {
    throw new Error(
      "Votre navigateur ne prend pas en charge WebCodecs. Utilisez une version récente de Chrome ou Edge."
    );
  }

  const originalResult = (): CompressionResult => ({
    file,
    cleanup: noop,
    originalSize: file.size,
    finalSize: file.size,
    skipped: true,
  });

  // Petit fichier : inutile de le recompresser.
  if (file.size < skipBelowBytes) {
    onProgress?.(100);
    return originalResult();
  }

  if (signal?.aborted) {
    throw new Error("Compression annulée.");
  }

  // ---------- Cible de sortie ----------
  // OPFS si possible (le flux est écrit sur disque, peu de RAM),
  // sinon repli sur un buffer en mémoire.
  const directory = await getOpfsDirectory();
  const tempName = directory ? `video-${crypto.randomUUID()}.mp4` : null;

  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    if (directory && tempName) {
      await directory.removeEntry(tempName).catch(() => undefined);
    }
  };

  let output: Output | null = null;
  let conversion: Conversion | null = null;

  const onAbort = () => {
    conversion?.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    let fileHandle: FileSystemFileHandle | null = null;
    let bufferTarget: BufferTarget | null = null;

    if (directory && tempName) {
      fileHandle = await directory.getFileHandle(tempName, { create: true });
      const writable = await fileHandle.createWritable();

      output = new Output({
        format: new Mp4OutputFormat(),
        target: new StreamTarget(writable, { chunked: true }),
      });
    } else {
      bufferTarget = new BufferTarget();

      output = new Output({
        // "in-memory" place les métadonnées au début : lecture web plus rapide.
        format: new Mp4OutputFormat({ fastStart: "in-memory" }),
        target: bufferTarget,
      });
    }

    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    // ---------- Configuration de la conversion ----------
    conversion = await Conversion.init({
      input,
      output,

      video: async (track) => ({
        codec: "avc",
        height: Math.min(maxHeight, await track.getDisplayHeight()),
        quality: new Quality("medium"),
        forceTranscode: true,
        hardwareAcceleration: "prefer-hardware",
      }),

      audio: {
        codec: "aac",
        quality: new Quality("medium"),
        forceTranscode: true,
      },
    });

    if (!conversion.isValid) {
      throw new Error(
        "Impossible de compresser cette vidéo avec les codecs disponibles sur votre navigateur."
      );
    }

    let lastPercent = -1;
    conversion.onProgress = (progress) => {
      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        onProgress?.(percent);
      }
    };

    await conversion.execute();

    if (signal?.aborted) {
      throw new Error("Compression annulée.");
    }

    // ---------- Récupération du résultat ----------
    let blob: Blob;

    if (fileHandle) {
      blob = await fileHandle.getFile();
    } else {
      const buffer = bufferTarget?.buffer;
      if (!buffer) {
        throw new Error("La compression n'a produit aucun fichier.");
      }
      blob = new Blob([buffer], { type: "video/mp4" });
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const compressedFile = new File([blob], `${baseName}.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });

    // Ne jamais remplacer l'original par un fichier plus gros.
    if (compressedFile.size >= file.size) {
      await cleanup();
      return originalResult();
    }

    // IMPORTANT : on ne supprime PAS le temporaire ici.
    // Le File retourné pointe vers lui jusqu'à la fin de l'upload.
    return {
      file: compressedFile,
      cleanup,
      originalSize: file.size,
      finalSize: compressedFile.size,
      skipped: false,
    };
  } catch (error) {
    if (output && output.state !== "finalized" && output.state !== "canceled") {
      await output.cancel().catch(() => undefined);
    }

    // En cas d'erreur, plus rien ne servira le fichier temporaire.
    await cleanup();

    console.error("Erreur de compression vidéo :", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Une erreur est survenue pendant la compression vidéo."
    );
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}