const ImageKit = require('imagekit');
const fs = require('fs');

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;

if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({
    publicKey: publicKey.trim(),
    privateKey: privateKey.trim(),
    urlEndpoint: urlEndpoint.trim()
  });
  console.log('⚡ ImageKit cloud CDN service connected successfully!');
} else {
  console.log('ℹ️ ImageKit credentials not fully set in .env. Using fast local upload fallback.');
}

/**
 * Uploads a file to ImageKit
 * @param {string} filePath - Local disk path of the temporary file
 * @param {string} fileName - Destination file name
 * @param {string} folder - ImageKit folder (e.g. /gym_feed or /transformations)
 * @returns {Promise<string|null>} - ImageKit CDN URL or null
 */
async function uploadToImageKit(filePath, fileName, folder = '/gym_photos') {
  if (!imagekit) return null;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const res = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName || `photo_${Date.now()}`,
      folder: folder,
      useUniqueFileName: true
    });
    return res.url;
  } catch (error) {
    console.error('ImageKit upload error:', error.message || error);
    return null;
  }
}

module.exports = { imagekit, uploadToImageKit };

