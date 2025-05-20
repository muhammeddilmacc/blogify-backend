import { CollectionReference, FieldValue, Firestore } from 'firebase-admin/firestore';
import { injectable } from 'inversify';

@injectable()
export abstract class BaseFirestoreRepository<T extends { id: string }> {
  protected collection: CollectionReference;
  protected db: Firestore;

  constructor(collectionName: string, db: Firestore) {
    this.db = db;
    this.collection = this.db.collection(collectionName);
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const docRef = this.collection.doc();
    const timestamp = FieldValue.serverTimestamp();
    
    const documentData = {
      ...data,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as T;

    await docRef.set(documentData);
    return documentData;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    console.log('REPOSITORY - Update Started:', { id, data });
    
    try {
      // Null veya undefined değerleri kaldır
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      console.log('REPOSITORY - Cleaned Data:', cleanData);
      
      const timestamp = FieldValue.serverTimestamp();
      const updateData = {
        ...cleanData,
        updatedAt: timestamp,
      };

      console.log('REPOSITORY - Final Update Data:', updateData);

      await this.collection.doc(id).update(updateData);
      console.log('REPOSITORY - Update Completed Successfully');
    } catch (error) {
      console.error('REPOSITORY - Update Error:', error);
      if (error instanceof Error) {
        console.error('REPOSITORY - Error Details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw new Error(`Firestore güncelleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }

  async findAll(limit: number = 10, startAfterId?: string): Promise<{ items: T[]; lastDoc: any }> {
    let query = this.collection
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfterId) {
      const startAfterDoc = await this.collection.doc(startAfterId).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => doc.data() as T);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return { items, lastDoc };
  }

  async findWhere(field: keyof T, operator: '==' | '>' | '<' | '>=' | '<=', value: any): Promise<T[]> {
    const snapshot = await this.collection
      .where(field as string, operator, value)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as T);
  }
} 