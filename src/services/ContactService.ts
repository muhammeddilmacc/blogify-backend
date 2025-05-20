import { inject, injectable } from 'inversify';
import { Contact } from '../models/Contact';
import { IContactRepository } from '../abstracts/interfaces/repositories/IContactRepository';
import { TYPES } from '../utils/types';

@injectable()
export class ContactService {
  constructor(
    @inject(TYPES.IContactRepository)
    private contactRepository: IContactRepository,
  ) {}

  async getContact(): Promise<Contact | null> {
    return this.contactRepository.getContact();
  }

  async updateContact(contactData: Partial<Contact>): Promise<Contact> {
    const existingContact = await this.contactRepository.getContact();

    if (!existingContact) {
      throw new Error('Contact information not found');
    }

    const updatedContact = new Contact(
      contactData.email ?? existingContact.email,
      'facebook' in contactData ? contactData.facebook : existingContact.facebook,
      'twitter' in contactData ? contactData.twitter : existingContact.twitter,
      'instagram' in contactData ? contactData.instagram : existingContact.instagram,
    );

    updatedContact.id = existingContact.id;
    return this.contactRepository.updateContact(updatedContact);
  }

  async createContact(contactData: {
    email: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  }): Promise<Contact> {
    const existingContact = await this.contactRepository.getContact();
    
    if (existingContact) {
      throw new Error('Contact information already exists');
    }

    const contact = new Contact(
      contactData.email,
      contactData.facebook,
      contactData.twitter,
      contactData.instagram,
    );

    return this.contactRepository.createContact(contact);
  }
} 