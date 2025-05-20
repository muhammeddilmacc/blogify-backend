var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import fs from 'fs';
import path from 'path';
import { injectable } from 'inversify';
import { logger } from '../utils/logger.js';
let FileService = class FileService {
    constructor() {
        this.uploadDir = 'public/uploads';
        // Upload dizininin varlığını kontrol et ve yoksa oluştur
        const uploadPath = path.join(process.cwd(), this.uploadDir);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
    }
    /**
     * Dosyayı siler
     * @param filename - Silinecek dosyanın adı
     * @returns boolean - İşlemin başarılı olup olmadığı
     */
    async deleteFile(filename) {
        try {
            if (!filename) {
                logger.warn('Silinecek dosya adı belirtilmedi');
                return false;
            }
            // Dosya adından tam yolu oluştur
            const filePath = path.join(process.cwd(), this.uploadDir, path.basename(filename));
            // Dosyanın varlığını kontrol et
            if (!fs.existsSync(filePath)) {
                logger.warn(`Dosya bulunamadı: ${filePath}`);
                return false;
            }
            // Dosyayı sil
            await fs.promises.unlink(filePath);
            logger.info(`Dosya başarıyla silindi: ${filePath}`);
            return true;
        }
        catch (error) {
            logger.error('Dosya silinirken hata oluştu:', error);
            return false;
        }
    }
    /**
     * URL'den dosya adını ayıklar
     * @param url - Dosya URL'i
     * @returns string - Dosya adı
     */
    extractFilenameFromUrl(url) {
        if (!url)
            return '';
        return path.basename(url);
    }
};
FileService = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], FileService);
export { FileService };
