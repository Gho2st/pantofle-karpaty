// components/admin/ImageProcessor.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

const OUTPUT_SIZE = 1000;
const OUTPUT_QUALITY = 0.85;
const OUTPUT_FORMAT = "image/webp";
const OUTPUT_EXT = "webp";
const BG_COLOR = "#ffffff";

const OBJECT_FILL_RATIO = 0.88;
const ALPHA_THRESHOLD = 20;
const COLOR_THRESHOLD = 30;
const MAX_ANALYSIS_SIZE = 800;

const MAX_CONCURRENT_BG_OPS = 1;

export default function ImageProcessor({ images, onChange }) {
  const [loadingModel, setLoadingModel] = useState(false);
  const fileInputRef = useRef(null);
  const removeBackgroundRef = useRef(null);

  const activeBgOps = useRef(0);
  const bgQueue = useRef([]);

  const runWithBgSemaphore = async (fn) => {
    return new Promise((resolve, reject) => {
      const task = async () => {
        activeBgOps.current++;
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          activeBgOps.current--;
          const next = bgQueue.current.shift();
          if (next) next();
        }
      };

      if (activeBgOps.current < MAX_CONCURRENT_BG_OPS) {
        task();
      } else {
        bgQueue.current.push(task);
      }
    });
  };

  const ensureModelLoaded = async () => {
    if (removeBackgroundRef.current) return removeBackgroundRef.current;
    setLoadingModel(true);
    try {
      const mod = await import("@imgly/background-removal");
      const removeBackground = mod.removeBackground || mod.default;
      removeBackgroundRef.current = (input, opts = {}) =>
        removeBackground(input, opts);
      return removeBackgroundRef.current;
    } catch (err) {
      toast.error("Nie udało się załadować modelu usuwania tła");
      throw err;
    } finally {
      setLoadingModel(false);
    }
  };

  const handleFilesAdded = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const newItems = await Promise.all(
        files.map(async (file) => {
          const normalizedFile = await normalizeImage(file, {
            cropMode: "contain",
          });
          return {
            id: crypto.randomUUID(),
            kind: "new",
            file: normalizedFile,
            originalFile: file,
            previewUrl: URL.createObjectURL(normalizedFile),
            processed: false,
            processing: false,
            cropMode: "contain",
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

  const handleConvertExisting = async (id, { cropMode }) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.kind !== "existing") return;

    let removeBackground = null;
    if (cropMode === "remove-bg") {
      try {
        removeBackground = await ensureModelLoaded();
      } catch {
        return;
      }
    }

    onChange(images.map((i) => (i.id === id ? { ...i, converting: true } : i)));

    try {
      const res = await fetch(
        `/api/proxy-image?url=${encodeURIComponent(target.url)}`,
      );
      if (!res.ok)
        throw new Error(`Nie udało się pobrać zdjęcia (HTTP ${res.status})`);

      const blob = await res.blob();
      const urlPath = new URL(target.url).pathname;
      const originalName = decodeURIComponent(
        urlPath.split("/").pop() || "image.jpg",
      );
      const originalFile = new File([blob], originalName, {
        type: blob.type || "image/jpeg",
      });

      let imageBlob = blob;
      if (cropMode === "remove-bg" && removeBackground) {
        imageBlob = await runWithBgSemaphore(() =>
          removeBackground(originalFile),
        );
      }

      const finalFile = await drawOnSquare(imageBlob, originalName, {
        cropMode,
      });
      const previewUrl = URL.createObjectURL(finalFile);

      onChange(
        images.map((i) =>
          i.id === id
            ? {
                id: i.id,
                kind: "new",
                file: finalFile,
                originalFile,
                previewUrl,
                processed: cropMode !== "contain",
                cropMode,
                processing: false,
                replacesUrl: target.url,
              }
            : i,
        ),
      );

      const msg =
        cropMode === "remove-bg"
          ? "Tło usunięte + wykadrowano!"
          : cropMode === "crop-object"
            ? "Wykadrowano obiekt (tło zachowane)!"
            : "Przekonwertowano na WebP!";
      toast.success(msg);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Błąd konwersji");
      onChange(
        images.map((i) => (i.id === id ? { ...i, converting: false } : i)),
      );
    }
  };

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
      const blobNoBg = await runWithBgSemaphore(() =>
        removeBackground(target.originalFile),
      );
      const finalFile = await drawOnSquare(blobNoBg, target.originalFile.name, {
        cropMode: "remove-bg",
      });

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
                cropMode: "remove-bg",
                processing: false,
              }
            : i,
        ),
      );
      toast.success("Tło usunięte + wykadrowano!");
    } catch (err) {
      console.error(err);
      toast.error("Błąd usuwania tła");
      onChange(
        images.map((i) => (i.id === id ? { ...i, processing: false } : i)),
      );
    }
  };

  const handleTightCrop = async (id) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.kind !== "new") return;

    onChange(images.map((i) => (i.id === id ? { ...i, processing: true } : i)));

    try {
      const finalFile = await drawOnSquare(
        target.originalFile,
        target.originalFile.name,
        {
          cropMode: "crop-object",
        },
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
                cropMode: "crop-object",
                processing: false,
              }
            : i,
        ),
      );
      toast.success("Obiekt wykadrowany (tło zachowane)!");
    } catch (err) {
      console.error(err);
      toast.error("Błąd kadrowania");
      onChange(
        images.map((i) => (i.id === id ? { ...i, processing: false } : i)),
      );
    }
  };

  const handleUndo = async (id) => {
    const target = images.find((i) => i.id === id);
    if (!target || target.kind !== "new") return;

    try {
      const restored = await normalizeImage(target.originalFile, {
        cropMode: "contain",
      });
      URL.revokeObjectURL(target.previewUrl);

      onChange(
        images.map((i) =>
          i.id === id
            ? {
                ...i,
                file: restored,
                previewUrl: URL.createObjectURL(restored),
                processed: false,
                cropMode: "contain",
              }
            : i,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Błąd cofania");
    }
  };

  const handleRemove = (id) => {
    const target = images.find((i) => i.id === id);
    if (!target) return;

    if (target.kind === "new") {
      if (target.replacesUrl) {
        URL.revokeObjectURL(target.previewUrl);
        onChange(
          images.map((i) =>
            i.id === id
              ? {
                  id: i.id,
                  kind: "existing",
                  url: target.replacesUrl,
                  removed: false,
                }
              : i,
          ),
        );
      } else {
        URL.revokeObjectURL(target.previewUrl);
        onChange(images.filter((i) => i.id !== id));
      }
    } else {
      onChange(
        images.map((i) => (i.id === id ? { ...i, removed: !i.removed } : i)),
      );
    }
  };

  const handleMove = (id, direction) => {
    const idx = images.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  useEffect(() => {
    return () => {
      images.forEach((i) => {
        if (i.kind === "new") URL.revokeObjectURL(i.previewUrl);
      });
    };
  }, [images]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Zdjęcia produktu
          <span className="block text-xs font-normal text-gray-500">
            Obiekt zajmuje ~{Math.round(OBJECT_FILL_RATIO * 100)}% kadru po
            kadrowaniu
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
            const isExisting = img.kind === "existing";
            const isRemoved = isExisting && img.removed;
            const isConverting = isExisting && img.converting;
            const isReplaced = isNew && !!img.replacesUrl;
            const previewSrc = isNew ? img.previewUrl : img.url;

            return (
              <div
                key={img.id}
                className={`relative bg-white border-2 rounded-lg overflow-hidden transition ${
                  isRemoved
                    ? "border-red-400 opacity-50"
                    : isReplaced
                      ? "border-blue-500"
                      : isNew && img.processed
                        ? "border-green-400"
                        : isNew
                          ? "border-blue-300"
                          : "border-gray-200"
                }`}
              >
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded z-10">
                  #{idx + 1}
                </div>

                <div className="absolute top-1 right-1 z-10 flex flex-col gap-1 items-end">
                  {isReplaced ? (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      ZAMIENIONE
                    </span>
                  ) : isNew ? (
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
                      {img.cropMode === "remove-bg"
                        ? "✓ tło usunięte"
                        : "✓ wykadrowany"}
                    </span>
                  )}
                  {isRemoved && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                      DO USUNIĘCIA
                    </span>
                  )}
                </div>

                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                  {(isNew && img.processing) || isConverting ? (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Spinner big />
                      <span className="text-xs">
                        {isConverting ? "Konwersja..." : "Przetwarzanie..."}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={previewSrc}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {isNew && (
                  <div className="px-2 py-1 text-[10px] text-gray-500 bg-white border-t border-gray-100 text-center font-mono">
                    {formatSize(img.file?.size)} · WebP
                    {isReplaced && " · zastąpi oryginał"}
                  </div>
                )}

                <div className="p-2 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-1">
                  {isExisting && !isRemoved && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleConvertExisting(img.id, { cropMode: "contain" })
                        }
                        disabled={isConverting}
                        className="col-span-2 px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                      >
                        🔄 Konwertuj na WebP
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleConvertExisting(img.id, {
                            cropMode: "crop-object",
                          })
                        }
                        disabled={isConverting}
                        className="col-span-2 px-2 py-1.5 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:bg-gray-400 transition font-medium"
                      >
                        📐 Kadruj obiekt (tło zachowane)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleConvertExisting(img.id, {
                            cropMode: "remove-bg",
                          })
                        }
                        disabled={isConverting || loadingModel}
                        className="col-span-2 px-2 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-medium"
                      >
                        ✨ Usuń tło + kadruj
                      </button>
                    </>
                  )}

                  {isNew && !img.processed && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTightCrop(img.id)}
                        disabled={img.processing}
                        className="col-span-2 px-2 py-1.5 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:bg-gray-400 transition font-medium"
                      >
                        {img.processing
                          ? "Przetwarzanie..."
                          : "📐 Tylko wykadruj obiekt"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBg(img.id)}
                        disabled={img.processing || loadingModel}
                        className="col-span-2 px-2 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-medium"
                      >
                        {img.processing
                          ? "Przetwarzanie..."
                          : "✨ Usuń tło + kadruj"}
                      </button>
                    </>
                  )}

                  {isNew && img.processed && (
                    <button
                      type="button"
                      onClick={() => handleUndo(img.id)}
                      className="col-span-2 px-2 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition font-medium"
                    >
                      ↶ Cofnij do oryginalnego
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
                    {isReplaced
                      ? "↶ Cofnij konwersję"
                      : isNew
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
    const isBlob = source instanceof Blob;
    const url = isBlob ? URL.createObjectURL(source) : source;

    if (!isBlob) img.crossOrigin = "anonymous";

    img.onload = () => {
      if (isBlob) URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (isBlob) URL.revokeObjectURL(url);
      reject(new Error("Nie udało się wczytać obrazu"));
    };
    img.src = url;
  });
}

async function normalizeImage(file, { cropMode = "contain" } = {}) {
  const img = await loadImage(file);
  return drawOnSquare(img, file.name, { cropMode });
}

async function drawOnSquare(
  source,
  originalName,
  { cropMode = "contain" } = {},
) {
  const img =
    source instanceof HTMLImageElement ? source : await loadImage(source);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    let srcX = 0;
    let srcY = 0;
    let srcW = img.width;
    let srcH = img.height;
    let targetRatio = 1.0;

    if (cropMode === "crop-object" || cropMode === "remove-bg") {
      const bbox =
        cropMode === "remove-bg"
          ? findAlphaBoundingBox(img)
          : findObjectBoundingBox(img);

      if (bbox && bbox.width > 0 && bbox.height > 0) {
        srcX = bbox.x;
        srcY = bbox.y;
        srcW = bbox.width;
        srcH = bbox.height;
        targetRatio = OBJECT_FILL_RATIO;
      }
    }

    const availableSize = OUTPUT_SIZE * targetRatio;
    const scale = Math.min(availableSize / srcW, availableSize / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (OUTPUT_SIZE - drawW) / 2;
    const dy = (OUTPUT_SIZE - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, srcX, srcY, srcW, srcH, dx, dy, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas toBlob failed"));
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

function findObjectBoundingBox(img) {
  const canvas = document.createElement("canvas");
  const ratio = Math.min(
    MAX_ANALYSIS_SIZE / Math.max(img.width, img.height),
    1,
  );
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const getPixel = (x, y) => {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const corners = [
    getPixel(0, 0),
    getPixel(w - 1, 0),
    getPixel(0, h - 1),
    getPixel(w - 1, h - 1),
  ];
  const bgR = Math.round(
    (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4,
  );
  const bgG = Math.round(
    (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4,
  );
  const bgB = Math.round(
    (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4,
  );

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const diff =
        Math.abs(data[i] - bgR) +
        Math.abs(data[i + 1] - bgG) +
        Math.abs(data[i + 2] - bgB);
      if (diff > COLOR_THRESHOLD) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) return null;

  const scale = img.width / w;
  return {
    x: Math.floor(minX * scale),
    y: Math.floor(minY * scale),
    width: Math.ceil((maxX - minX + 1) * scale),
    height: Math.ceil((maxY - minY + 1) * scale),
  };
}

function findAlphaBoundingBox(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, img.width, img.height);
  } catch {
    return null;
  }

  const data = imageData.data;
  const w = img.width;
  const h = img.height;

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > ALPHA_THRESHOLD) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) return null;

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
