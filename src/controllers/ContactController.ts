import type { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ContactService } from '../services/ContactService';
import { BaseController } from '@/abstracts/BaseController';
import { TYPES } from '@/utils/types';

@injectable()
export class ContactController extends BaseController {
  constructor(@inject(TYPES.ContactService) private contactService: ContactService) {
    super();
  }

  async getContact(req: Request, res: Response): Promise<void> {
    try {
      const contact = await this.contactService.getContact();
      this.success(res, contact);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateContact(req: Request, res: Response): Promise<void> {
    try {
      const contactData = req.body;
      const updatedContact = await this.contactService.updateContact(contactData);
      this.success(res, { contact: updatedContact, message: 'İletişim bilgileri başarıyla güncellendi' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Contact information not found') {
        this.notFound(res, 'İletişim bilgileri bulunamadı');
        return;
      }
      this.handleError(error, res);
    }
  }

  async createContact(req: Request, res: Response): Promise<void> {
    try {
      const contactData = req.body;
      const newContact = await this.contactService.createContact(contactData);
      this.created(res, { contact: newContact });
    } catch (error) {
      if (error instanceof Error && error.message === 'Contact information already exists') {
        this.badRequest(res, 'İletişim bilgileri zaten mevcut');
        return;
      }
      this.handleError(error, res);
    }
  }
} 