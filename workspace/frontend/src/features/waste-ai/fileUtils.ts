export interface ProcessedImage {
  dataUrl: string;
  mimeType: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Converts a data URL to an Object URL (blob:) to avoid bloating history/router state.
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  try {
    const parts = dataUrl.split(",");
    if (parts.length < 2) return dataUrl;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl;
  }
}

/**
 * Reads and optimizes an image file into a Base64 Data URL and corresponding MIME type.
 * Automatically resizes large images to max 1280px to avoid browser
 * NetworkError / payload size limits when calling vision APIs.
 * Explicitly rejects non-image or unsupported formats (SVGs, PDFs, binaries).
 */
export function fileToBase64(
  file: File,
  maxDimension = 1280,
  quality = 0.88
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type) {
      return reject(new Error("Invalid file provided."));
    }

    const lowerType = file.type.toLowerCase();
    if (lowerType === "image/svg+xml" || !ALLOWED_MIME_TYPES.has(lowerType)) {
      return reject(
        new Error(
          `Unsupported file format "${file.type}". Please upload a JPEG, PNG, WebP, or HEIC photo.`
        )
      );
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If image is already smaller than maxDimension, return rawDataUrl directly with original type
        if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/jpeg" });
          return;
        }

        // Scale down keeping exact aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/jpeg" });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG for compact payload and pair with image/jpeg MIME type
        const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({ dataUrl: optimizedDataUrl, mimeType: "image/jpeg" });
      };

      img.onerror = () => reject(new Error("Failed to decode image file."));
      img.src = rawDataUrl;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
