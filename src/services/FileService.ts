import fs from 'fs';
import path from 'path';
import { injectable } from 'inversify';
import { logger } from '@/utils/logger';

@injectable()
export class FileService {
  private readonly uploadDir = 'public/uploads';

  constructor() {
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
  async deleteFile(filename: string): Promise<boolean> {
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
    } catch (error) {
      logger.error('Dosya silinirken hata oluştu:', error);
      return false;
    }
  }

  /**
   * URL'den dosya adını ayıklar
   * @param url - Dosya URL'i
   * @returns string - Dosya adı
   */
  extractFilenameFromUrl(url: string): string {
    if (!url) return '';
    return path.basename(url);
  }
} 