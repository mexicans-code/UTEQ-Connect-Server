import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req: Request, file: Express.Multer.File) => {
        let folder = 'uteq/destinos';
        const url = req.baseUrl + (req.path || '');
        if (url.includes('/events'))   folder = 'uteq/events';
        else if (url.includes('/espacios')) folder = 'uteq/espacios';
        else if (url.includes('/personal')) folder = 'uteq/personal';
        else if (url.includes('/users'))    folder = 'uteq/users';
        else if (url.includes('/locations')) folder = 'uteq/destinos';
 
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
 
        return {
            folder,
            public_id: uniqueName,
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        };
    },
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
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});

export { cloudinary };