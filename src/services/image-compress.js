/* eslint-env browser */
// Simple client-side image compression using canvas
// Resizes to maxWidth while preserving aspect ratio and outputs JPEG at given quality

export async function compressImageToJpeg(file, options = {}) {
  const { maxWidth = 256, quality = 0.68 } = options;

  if (!(file instanceof Blob)) {
    throw new Error('compressImageToJpeg expects a File or Blob');
  }

  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  const { width, height } = getScaledDimensions(image.width, image.height, maxWidth);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  // Return a File to preserve filename semantics if input was a File
  const outputName = getOutputName(file, 'jpeg');
  return new File([blob], outputName, { type: 'image/jpeg' });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function getScaledDimensions(origW, origH, maxWidth) {
  if (origW <= maxWidth) return { width: origW, height: origH };
  const scale = maxWidth / origW;
  return { width: Math.round(origW * scale), height: Math.round(origH * scale) };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function getOutputName(file, ext) {
  const name = typeof file.name === 'string' ? file.name : 'image';
  const base = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
  return `${base}.` + ext;
}
