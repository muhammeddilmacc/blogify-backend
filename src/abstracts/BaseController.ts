import { Response } from 'express';
import { Logger } from '@/utils/logger';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseController {
  protected logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  protected success<T>(res: Response, data: T): void {
    res.status(200).json(data);
  }

  protected created<T>(res: Response, data: T): void {
    res.status(201).json({
      message: 'Kayıt başarıyla oluşturuldu',
      data
    });
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }

  protected badRequest(res: Response, message: string): void {
    res.status(400).json({
      error: message
    });
  }

  protected unauthorized(res: Response, message: string = 'Yetkisiz erişim'): void {
    res.status(401).json({
      error: message
    });
  }

  protected forbidden(res: Response, message: string = 'Bu işlem için yetkiniz yok'): void {
    res.status(403).json({
      error: message
    });
  }

  protected notFound(res: Response, message: string): void {
    res.status(404).json({
      error: message
    });
  }

  protected handleError(error: unknown, res: Response): void {
    this.logger.error('İşlem hatası:', error);

    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      });
    } else {
      res.status(500).json({
        error: 'Beklenmeyen bir hata oluştu'
      });
    }
  }
} 