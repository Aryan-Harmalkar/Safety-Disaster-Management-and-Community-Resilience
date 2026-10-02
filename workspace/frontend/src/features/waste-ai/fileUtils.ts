export interface ProcessedImage {
  dataUrl: string;
  mimeType: string;
}

/**
 * Reads and optimizes an image file into a Base64 Data URL and corresponding MIME type.
 * Automatically resizes large images to max 1280px to avoid browser
 * NetworkError / payload size limits when calling vision APIs.
 */
export function fileToBase64(
  file: File,
  maxDimension = 1280,
  quality = 0.88
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // If SVG or not an image, read directly with original type
    if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ dataUrl: reader.result as string, mimeType: file.type || "application/octet-stream" });
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
      return;
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

      img.onerror = () => resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/jpeg" });
      img.src = rawDataUrl;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
