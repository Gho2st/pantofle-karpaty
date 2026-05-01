// components/admin/ImageProcessor.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

const OUTPUT_SIZE = 1000;
const OUTPUT_QUALITY = 0.85;
const OUTPUT_FORMAT = "image/webp";
const OUTPUT_EXT = "webp";
const BG_COLOR = "#ffffff";

export default function ImageProcessor({ images, onChange }) {
  const [loadingModel, setLoadingModel] = useState(false);
  const fileInputRef = useRef(null);
  const removeBackgroundRef = useRef(null);

  const ensureModelLoaded = async () => {
    if (removeBackgroundRef.current) return removeBackgroundRef.current;
    setLoadingModel(true);
    try {
      const mod = await import("@imgly/background-removal");
      removeBackgroundRef.current = mod.removeBackground || mod.default;
      return removeBackgroundRef.current;
    } catch (err) {
      toast.error("Nie udało się załadować modelu usuwania tła");
      throw err;
    } finally {
      setLoadingModel(false);
    }
  };

  // === DODAWANIE NOWYCH PLIKÓW ===
  const handleFilesAdded = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const newItems = await Promise.all(
        files.map(async (file) => {
          const normalizedFile = await normalizeImage(file);
          return {
            id: crypto.randomUUID(),
            kind: "new",
            file: normalizedFile,
            originalFile: file,
            previewUrl: URL.createObjectURL(normalizedFile),
            processed: false,
            processing: false,
          };
        }),
      );
      onChange([...images, ...newItems]);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas wczytywania zdjęć");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // === USUWANIE TŁA (tylko dla nowych plików) ===
  const handleRemoveBg = async (id) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.kind !== "new") return;

    let removeBackground;
    try {
      removeBackground = await ensureModelLoaded();
    } catch {
      return;
    }

    onChange(images.map((i) => (i.id === id ? { ...i, processing: true } : i)));

    try {
      const blobNoBg = await removeBackground(target.originalFile);
      const finalFile = await composeOnWhiteSquare(
        blobNoBg,
        target.originalFile.name,
      );

      const newPreviewUrl = URL.createObjectURL(finalFile);
      URL.revokeObjectURL(target.previewUrl);

      onChange(
        images.map((i) =>
          i.id === id
            ? {
                ...i,
                file: finalFile,
                previewUrl: newPreviewUrl,
                processed: true,
                processing: false,
              }
            : i,
        ),
      );
      toast.success("Tło usunięte!");
    } catch (err) {
      console.error(err);
      toast.error("Błąd usuwania tła");
      onChange(
        images.map((i) => (i.id === id ? { ...i, processing: false } : i)),
      );
    }
  };

  // === COFNIJ USUNIĘCIE TŁA ===
  const handleUndoBg = async (id) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.kind !== "new") return;
    try {
      const restored = await normalizeImage(target.originalFile);
      URL.revokeObjectURL(target.previewUrl);
      onChange(
        images.map((i) =>
          i.id === id
            ? {
                ...i,
                file: restored,
                previewUrl: URL.createObjectURL(restored),
                processed: false,
              }
            : i,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Błąd cofania");
    }
  };

  // === USUWANIE / PRZYWRACANIE ===
  // Dla nowych: usuwa z listy.
  // Dla istniejących: oznacza jako removed (toggle).
  const handleRemove = (id) => {
    const target = images.find((i) => i.id === id);
    if (!target) return;

    if (target.kind === "new") {
      URL.revokeObjectURL(target.previewUrl);
      onChange(images.filter((i) => i.id !== id));
    } else {
      onChange(
        images.map((i) => (i.id === id ? { ...i, removed: !i.removed } : i)),
      );
    }
  };

  // === ZMIANA KOLEJNOŚCI ===
  const handleMove = (id, direction) => {
    const idx = images.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  // Cleanup blob URLs przy unmount
  useEffect(() => {
    return () => {
      images.forEach((i) => {
        if (i.kind === "new") URL.revokeObjectURL(i.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Zdjęcia produktu
          <span className="block text-xs font-normal text-gray-500">
            Nowe zdjęcia automatycznie konwertowane do WebP 1000×1000 (białe
            tło)
          </span>
        </label>
        {loadingModel && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Spinner /> Ładowanie modelu AI...
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFilesAdded}
        className="w-full p-3 border border-gray-300 rounded-md file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => {
            const isNew = img.kind === "new";
            const isRemoved = img.kind === "existing" && img.removed;
            const previewSrc = isNew ? img.previewUrl : img.url;

            return (
              <div
                key={img.id}
                className={`relative bg-white border-2 rounded-lg overflow-hidden transition ${
                  isRemoved
                    ? "border-red-400 opacity-50"
                    : isNew && img.processed
                      ? "border-green-400"
                      : isNew
                        ? "border-blue-300"
                        : "border-gray-200"
                }`}
              >
                {/* Numer kolejności */}
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded z-10">
                  #{idx + 1}
                </div>

                {/* Badge typu */}
                <div className="absolute top-1 right-1 z-10 flex flex-col gap-1 items-end">
                  {isNew ? (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                      NOWE
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded">
                      ZAPISANE
                    </span>
                  )}
                  {isNew && img.processed && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      ✓ tło usunięte
                    </span>
                  )}
                  {isRemoved && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                      DO USUNIĘCIA
                    </span>
                  )}
                </div>

                {/* Preview */}
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                  {isNew && img.processing ? (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Spinner big />
                      <span className="text-xs">Usuwanie tła...</span>
                    </div>
                  ) : (
                    <img
                      src={previewSrc}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Info o pliku */}
                {isNew && (
                  <div className="px-2 py-1 text-[10px] text-gray-500 bg-white border-t border-gray-100 text-center font-mono">
                    {formatSize(img.file?.size)} · WebP
                  </div>
                )}

                {/* Akcje */}
                <div className="p-2 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-1">
                  {isNew && !img.processed && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBg(img.id)}
                      disabled={img.processing || loadingModel}
                      className="col-span-2 px-2 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-medium"
                    >
                      {img.processing ? "Przetwarzanie..." : "✨ Usuń tło"}
                    </button>
                  )}
                  {isNew && img.processed && (
                    <button
                      type="button"
                      onClick={() => handleUndoBg(img.id)}
                      className="col-span-2 px-2 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition font-medium"
                    >
                      ↶ Cofnij usunięcie tła
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMove(img.id, "left")}
                    disabled={idx === 0}
                    className="px-2 py-1 bg-white border border-gray-300 text-xs rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Przesuń w lewo"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(img.id, "right")}
                    disabled={idx === images.length - 1}
                    className="px-2 py-1 bg-white border border-gray-300 text-xs rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Przesuń w prawo"
                  >
                    →
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(img.id)}
                    className={`col-span-2 px-2 py-1 text-xs rounded transition ${
                      isRemoved
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {isNew
                      ? "Usuń zdjęcie"
                      : isRemoved
                        ? "↶ Przywróć"
                        : "Usuń zdjęcie"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded border border-dashed border-gray-300">
          Brak zdjęć — dodaj przynajmniej jedno
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*                            HELPERS                                  */
/* ================================================================== */

function Spinner({ big = false }) {
  return (
    <svg
      className={`animate-spin ${big ? "w-8 h-8" : "w-4 h-4"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = source instanceof Blob ? URL.createObjectURL(source) : source;
    img.onload = () => {
      if (source instanceof Blob) URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      if (source instanceof Blob) URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function normalizeImage(file) {
  const img = await loadImage(file);
  return drawOnSquare(img, file.name);
}

async function composeOnWhiteSquare(blobNoBg, originalName) {
  const img = await loadImage(blobNoBg);
  return drawOnSquare(img, originalName);
}

function drawOnSquare(img, originalName) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const scale = Math.min(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (OUTPUT_SIZE - drawW) / 2;
    const dy = (OUTPUT_SIZE - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return reject(new Error("Canvas toBlob failed (WebP unsupported?)"));
        }
        const baseName = originalName.replace(/\.[^.]+$/, "");
        const file = new File([blob], `${baseName}.${OUTPUT_EXT}`, {
          type: OUTPUT_FORMAT,
        });
        resolve(file);
      },
      OUTPUT_FORMAT,
      OUTPUT_QUALITY,
    );
  });
}
