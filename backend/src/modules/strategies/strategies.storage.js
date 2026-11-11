
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../../utils/ApiError.js';

const storageDirectory = path.resolve(
    process.cwd(),
    'uploads',
    'strategies',
);

fs.mkdirSync(storageDirectory, { recursive: true });

const diskStorage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, storageDirectory);
    },

    filename: (_req, _file, callback) => {
        callback(null, `${randomUUID()}.pdf`);
    },
});

export const strategyUpload = multer({
    storage: diskStorage,

    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 1,
        fields: 0,
    },

    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (
            extension !== '.pdf' ||
            file.mimetype !== 'application/pdf'
        ) {
            return callback(
                new ApiError(400, 'Only PDF files are allowed'),
            );
        }

        callback(null, true);
    },
});

export function getStrategyFilePath(storageKey) {
    if (
        typeof storageKey !== 'string' ||
        !/^strategies\/[a-f0-9-]+\.pdf$/i.test(storageKey)
    ) {
        throw new ApiError(400, 'Invalid strategy file reference');
    }

    const fileName = path.basename(storageKey);
    const filePath = path.resolve(storageDirectory, fileName);

    if (!filePath.startsWith(`${storageDirectory}${path.sep}`)) {
        throw new ApiError(400, 'Invalid strategy file reference');
    }

    return filePath;
}

export async function validatePdfFile(filePath) {
    let handle;

    try {
        handle = await fs.promises.open(filePath, 'r');

        const buffer = Buffer.alloc(5);
        const { bytesRead } = await handle.read(buffer, 0, 5, 0);

        if (
            bytesRead !== 5 ||
            buffer.toString('ascii') !== '%PDF-'
        ) {
            throw new ApiError(400, 'Uploaded file is not a valid PDF');
        }
    } finally {
        await handle?.close();
    }
}

export async function deleteStrategyFile(storageKey) {
    const filePath = getStrategyFilePath(storageKey);

    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}

export function handleStrategyUploadError(error, _req, res, next) {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return next(
                new ApiError(400, 'Strategy PDF must not exceed 15 MB'),
            );
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return next(
                new ApiError(400, 'Only one PDF file is allowed'),
            );
        }

        return next(
            new ApiError(400, 'Invalid strategy file upload'),
        );
    }

    next(error);
}
