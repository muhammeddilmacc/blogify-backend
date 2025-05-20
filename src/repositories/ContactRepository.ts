import { injectable } from 'inversify';
import { Contact } from '../models/Contact';
import { IContactRepository } from '../abstracts/interfaces/repositories/IContactRepository';
import { db } from '../utils/config';
import { FieldValue } from 'firebase-admin/firestore';

@injectable()
export class ContactRepository implements IContactRepository {
  private readonly collectionName = 'contacts';

  async getContact(): Promise<Contact | null> {
    const snapshot = await db.collection(this.collectionName).limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Contact;
  }

  async updateContact(contact: Contact): Promise<Contact> {
    const docRef = db.collection(this.collectionName).doc(contact.id);
    
    const updateData = {
      ...contact,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Contact;
  }

  async createContact(contact: Contact): Promise<Contact> {
    const docRef = await db.collection(this.collectionName).add({
      ...contact,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Contact;
  }
} 