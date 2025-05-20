import { v2 as cloudinary } from 'cloudinary';
import { injectable } from 'inversify';
import { logger } from '@/utils/logger';
import { Readable } from 'stream';

@injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    try {
      // Buffer'ı stream'e çevir
      const stream = Readable.from(file.buffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'blog-posts',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error || !result) {
              logger.error('Cloudinary yükleme hatası:', error);
              reject(error || new Error('Yükleme başarısız'));
              return;
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      logger.error('Cloudinary yükleme hatası:', error);
      throw new Error('Resim yüklenirken bir hata oluştu');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Cloudinary silme hatası:', error);
      throw new Error('Resim silinirken bir hata oluştu');
    }
  }
} 