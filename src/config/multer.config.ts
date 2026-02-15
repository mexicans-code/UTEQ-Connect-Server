import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const destinosPath = path.join(process.cwd(), 'uploads', 'destinos');
const eventsPath = path.join(process.cwd(), 'uploads', 'events');

if (!fs.existsSync(destinosPath)) {
    fs.mkdirSync(destinosPath, { recursive: true });
}

if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        if (req.baseUrl.includes('/events')) {
            cb(null, 'uploads/events/');
        } else {
            cb(null, 'uploads/destinos/');
        }
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});