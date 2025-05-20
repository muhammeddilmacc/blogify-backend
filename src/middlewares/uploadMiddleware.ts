import multer from 'multer';
import path from 'path';
import { Request } from 'express';

interface IUploadConfig {
  fieldName: string;
  maxSize: number;
  allowedTypes: string[];
}

export class UploadMiddleware {
  private storage: multer.StorageEngine;
  private uploadConfig: IUploadConfig;

  constructor(config: Partial<IUploadConfig> = {}) {
    this.uploadConfig = {
      fieldName: config.fieldName || 'image',
      maxSize: config.maxSize || 5 * 1024 * 1024,
      allowedTypes: config.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    };

    // Memory storage kullan, dosyaları diske kaydetme
    this.storage = multer.memoryStorage();
  }

  private fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!this.uploadConfig.allowedTypes?.includes(file.mimetype)) {
      cb(new Error(`Sadece ${this.uploadConfig.allowedTypes?.join(', ')} formatları desteklenmektedir.`));
      return;
    }
    cb(null, true);
  };

  public getUploader() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: this.uploadConfig.maxSize
      },
      fileFilter: this.fileFilter
    });
  }

  public single() {
    return this.getUploader().single(this.uploadConfig.fieldName);
  }

  public array(maxCount: number = 10) {
    return this.getUploader().array(this.uploadConfig.fieldName, maxCount);
  }

  public fields(fields: multer.Field[]) {
    return this.getUploader().fields(fields);
  }
}

export const uploadMiddleware = new UploadMiddleware();
export const upload = uploadMiddleware.getUploader();

export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  // Dosya yüklendikten sonra public URL'ini döndür
  return `/uploads/${file.filename}`;
}; 