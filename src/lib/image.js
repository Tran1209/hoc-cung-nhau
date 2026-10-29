// Nén ảnh trước khi tải lên: tiết kiệm dung lượng (Supabase free = 1GB) mà vẫn rõ nét.
const MAX_SIDE = 2000;
const QUALITY = 0.85;

export async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    // Ảnh nhỏ & nhẹ thì giữ nguyên
    if (scale === 1 && file.size < 600 * 1024) return file;
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // trình duyệt không đọc được (vd HEIC) -> tải nguyên bản
  }
}

async function loadBitmap(file) {
  if (globalThis.createImageBitmap) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fallback bên dưới */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function fileExt(file) {
  const m = /\.(\w+)$/.exec(file.name || '');
  if (m) return m[1].toLowerCase();
  if (file.type === 'application/pdf') return 'pdf';
  return 'jpg';
}
