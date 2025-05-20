var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { v2 as cloudinary } from 'cloudinary';
import { injectable } from 'inversify';
import { logger } from '../utils/logger.js';
import { Readable } from 'stream';
let CloudinaryService = class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    async uploadImage(file) {
        try {
            // Buffer'ı stream'e çevir
            const stream = Readable.from(file.buffer);
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: 'blog-posts',
                    resource_type: 'auto'
                }, (error, result) => {
                    if (error || !result) {
                        logger.error('Cloudinary yükleme hatası:', error);
                        reject(error || new Error('Yükleme başarısız'));
                        return;
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                });
                stream.pipe(uploadStream);
            });
        }
        catch (error) {
            logger.error('Cloudinary yükleme hatası:', error);
            throw new Error('Resim yüklenirken bir hata oluştu');
        }
    }
    async deleteImage(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        }
        catch (error) {
            logger.error('Cloudinary silme hatası:', error);
            throw new Error('Resim silinirken bir hata oluştu');
        }
    }
};
CloudinaryService = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
export { CloudinaryService };
