/**
 * Shared media upload utilities used by admin upload flows.
 * - compressImage: shrinks images client-side before upload (~70-80% size reduction)
 * - uploadDirect:  uploads straight to Cloudinary from the browser (no server hop)
 * - uploadViaServer: server-side fallback using /api/upload
 * - uploadMedia: orchestrates compression + direct upload + fallback in one call
 */

/** Resize and re-encode an image to JPEG before sending it anywhere. */
export const compressImage = (file: File, maxPx = 1920, quality = 0.82): Promise<File> =>
  new Promise((resolve) => {
    if (!file.type.startsWith('image/')) { resolve(file); return; }
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx) { height = Math.round((height * maxPx) / width); width = maxPx; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
        'image/jpeg', quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

/** Upload a file directly from the browser to Cloudinary (fastest — no server hop).
 *  Pass an optional onProgress callback to receive 0–100 percent updates. */
export const uploadDirect = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; publicId: string }> => {
  const resourceType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

  const sigRes  = await fetch('/api/upload/signature', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceType }),
  });
  const sigData = await sigRes.json();
  if (!sigRes.ok || !sigData.success) throw new Error(sigData.message || 'Could not get upload credential.');

  const fd = new FormData();
  fd.append('file',      file);
  fd.append('api_key',   sigData.apiKey);
  fd.append('timestamp', String(sigData.timestamp));
  fd.append('signature', sigData.signature);
  fd.append('folder',    sigData.folder);
  if (resourceType === 'image') fd.append('transformation', 'c_limit,w_1920,f_auto,q_auto');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && !data.error) {
          resolve({ url: data.secure_url, publicId: data.public_id });
        } else {
          reject(new Error(data.error?.message || 'Direct upload failed.'));
        }
      } catch { reject(new Error('Invalid response from Cloudinary.')); }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
    xhr.send(fd);
  });
};

/** Server-side fallback — routes the file through /api/upload. */
export const uploadViaServer = async (file: File): Promise<{ url: string; publicId: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  const res  = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
  let data: { success?: boolean; message?: string; url?: string; publicId?: string } = {};
  try   { data = await res.json(); }
  catch { const text = await res.text().catch(() => ''); throw new Error(`Upload failed (${res.status}): ${text.slice(0, 120)}`); }
  if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
  return { url: data.url!, publicId: data.publicId! };
};

/**
 * Main upload function: compress (images only) → direct upload → server fallback.
 * Safe to call for both images and videos.
 * @param onProgress - optional callback receiving 0–100 progress (only during direct upload)
 */
export const uploadMedia = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; publicId: string }> => {
  const prepared = file.type.startsWith('image/') ? await compressImage(file) : file;
  try {
    return await uploadDirect(prepared, onProgress);
  } catch (err) {
    console.warn('[uploadMedia] Direct upload failed, using server fallback:', err);
    return await uploadViaServer(prepared);
  }
};
