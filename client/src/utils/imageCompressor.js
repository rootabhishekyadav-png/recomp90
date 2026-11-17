/**
 * Client-Side Image Compression Utility
 * Resizes large camera photos down to 1600px max dimension and applies 82% quality compression.
 * Reduces 5MB-12MB phone camera snapshots down to ~150KB-350KB before network upload.
 * Zero external dependencies, pure HTML5 Canvas & Blob API.
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = 'image/jpeg'
  } = options;

  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // If already under 150 KB and not a huge canvas, return as is
  if (file.size <= 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Background color for transparent PNGs
        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#121214';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const cleanFileName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_');
            const compressedFile = new File([blob], `${cleanFileName}.jpg`, {
              type: outputType,
              lastModified: Date.now()
            });

            console.log(
              `⚡ [ImageCompressor] ${(file.size / 1024).toFixed(1)} KB -> ${(
                compressedFile.size / 1024
              ).toFixed(1)} KB (${Math.round(
                (1 - compressedFile.size / file.size) * 100
              )}% saved)`
            );

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

