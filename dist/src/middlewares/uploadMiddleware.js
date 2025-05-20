import multer from 'multer';
import path from 'path';
import fs from 'fs';
export class UploadMiddleware {
    constructor(config = {}) {
        this.fileFilter = (req, file, cb) => {
            if (!this.uploadConfig.allowedTypes?.includes(file.mimetype)) {
                cb(new Error(`Sadece ${this.uploadConfig.allowedTypes?.join(', ')} formatları desteklenmektedir.`));
                return;
            }
            cb(null, true);
        };
        this.uploadConfig = {
            fieldName: config.fieldName || 'image',
            maxSize: config.maxSize || 5 * 1024 * 1024,
            allowedTypes: config.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
            uploadDir: config.uploadDir || 'public/uploads'
        };
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = path.join(process.cwd(), this.uploadConfig.uploadDir);
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        });
    }
    getUploader() {
        return multer({
            storage: this.storage,
            limits: {
                fileSize: this.uploadConfig.maxSize
            },
            fileFilter: this.fileFilter
        });
    }
    single() {
        return this.getUploader().single(this.uploadConfig.fieldName);
    }
    array(maxCount = 10) {
        return this.getUploader().array(this.uploadConfig.fieldName, maxCount);
    }
    fields(fields) {
        return this.getUploader().fields(fields);
    }
}
export const uploadMiddleware = new UploadMiddleware();
export const upload = uploadMiddleware.getUploader();
export const uploadFile = async (file) => {
    // Dosya yüklendikten sonra public URL'ini döndür
    return `/uploads/${file.filename}`;
};
