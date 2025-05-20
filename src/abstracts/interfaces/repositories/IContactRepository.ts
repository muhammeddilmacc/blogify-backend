import { Contact } from '../../../models/Contact';

export interface IContactRepository {
  getContact(): Promise<Contact | null>;
  updateContact(contact: Contact): Promise<Contact>;
  createContact(contact: Contact): Promise<Contact>;
} 