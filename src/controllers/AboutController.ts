import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AboutService } from '../services/AboutService';
import { BaseController } from '../abstracts/BaseController';
import { CloudinaryService } from '@/services/CloudinaryService';
import { TYPES } from '@/utils/types';

@injectable()
export class AboutController extends BaseController {
  constructor(
    @inject(AboutService) private aboutService: AboutService,
    @inject(TYPES.CloudinaryService) private cloudinaryService: CloudinaryService
  ) {
    super();
  }

  async getAbout(req: Request, res: Response): Promise<void> {
    try {
      const about = await this.aboutService.getAbout();
      this.success(res, about);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateAbout(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      let imageUrl = '';
      let imagePublicId = '';
      
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }

      const aboutData = {
        name: req.body.name,
        description: req.body.description,
        imageUrl: imageUrl || req.body.imageUrl,
        imagePublicId: imagePublicId || req.body.imagePublicId
      };

      const updatedAbout = await this.aboutService.updateAbout(aboutData);
      this.success(res, updatedAbout);
    } catch (error) {
      this.handleError(error, res);
    }
  }
} 