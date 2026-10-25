import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { authenticate } from '../../middlewares/auth.js';
import { ApiError } from '../../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Serverless platforms mount the deployment read-only, so uploads go to the
   writable temporary directory there instead of the project folder. */
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'orvia-uploads')
  : path.resolve(__dirname, '../../../uploads');

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.warn(`Could not prepare the upload directory at ${uploadDir}:`, error.message);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export const filesRouter = Router();

filesRouter.use(authenticate);

filesRouter.post('/upload', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'No file was uploaded'));
  }

  const { filename, originalname, mimetype, size } = req.file;
  const fileUrl = `/api/files/${encodeURIComponent(filename)}`;

  res.status(201).json({
    success: true,
    data: {
      id: filename,
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    },
  });
});

filesRouter.get('/:filename', (req, res, next) => {
  const sanitized = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, sanitized);

  if (!fs.existsSync(filePath)) {
    return next(new ApiError(404, 'File not found'));
  }

  res.sendFile(filePath);
});
