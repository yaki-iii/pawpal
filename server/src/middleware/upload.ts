import multer from 'multer';
import path from 'path';
import { config } from '../config';

/**
 * Multer storage configuration.
 * Files are saved to server/uploads/{date}/{timestamp}-{random}.ext
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const uploadPath = path.resolve(process.cwd(), config.upload.dir, dateStr);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

/**
 * File filter — allow image and video formats.
 */
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件格式，仅支持 jpg/jpeg/png/webp 图片和 mp4/webm/quicktime 视频'));
  }
};

/**
 * Multer upload instance configured for image and video uploads.
 * - Max file size: 50MB (to accommodate videos)
 * - Max files per request: 9 (for nine-grid image layout)
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 9,
  },
});

/**
 * Middleware for single image upload (field name: "image").
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware for multiple image uploads (field name: "images", max 9).
 */
export const uploadMultiple = upload.array('images', 9);

/**
 * Middleware for mixed media uploads (images + videos, field name: "media", max 9).
 */
export const uploadMedia = upload.array('media', 9);

/**
 * Helper to construct the public URL for an uploaded file.
 */
export function getFileUrl(filename: string, dateStr: string): string {
  return `/api/v1/uploads/${dateStr}/${filename}`;
}
