import { IDPhotoSizeConfig } from '../types';

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * 转换图片格式
 */
export async function performConvert(
  dataUrl: string,
  format: ImageFormat,
  quality: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas.toDataURL(format, quality));
    };
    img.src = dataUrl;
  });
}

/**
 * 调整图片大小
 */
export async function performResize(
  dataUrl: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

/**
 * 裁剪为证件照尺寸
 */
export async function cropToIdSize(
  dataUrl: string,
  size: IDPhotoSizeConfig
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size.pxWidth;
      canvas.height = size.pxHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.src = dataUrl;
  });
}

/**
 * 压缩图片到目标大小
 */
export async function compressImageToSize(
  dataUrl: string,
  targetSizeKb: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      let quality = 0.95;
      let result = '';
      const target = targetSizeKb * 1024;

      for (let i = 0; i < 12; i++) {
        result = canvas.toDataURL('image/jpeg', quality);
        if (Math.round((result.length * 3) / 4) <= target) break;
        quality *= 0.85;
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
}
