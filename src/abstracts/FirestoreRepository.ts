import type { firestore } from 'firebase-admin';
import type { IModel } from '@/abstracts/interfaces/models/IModel';
import type { IBaseRepository } from '@/abstracts/interfaces/repositories/IBaseRepository';
import { injectable, unmanaged } from 'inversify';
import { db } from '@/utils/config';

@injectable()
export abstract class FirestoreRepository<T extends IModel>
  implements IBaseRepository<T>
{
  protected collection: firestore.CollectionReference;

  constructor(@unmanaged() collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async create(item: T): Promise<void> {
    console.log('item.uid: ', item.uid);
    const docRef = item.uid
      ? this.collection.doc(item.uid)
      : this.collection.doc();
    console.log('docRef: ', docRef);
    await docRef.set(item as firestore.DocumentData);
  }

  async update(item: T): Promise<void> {
    const docRef = this.collection.doc(item.uid);
    await docRef.update(item as firestore.DocumentData);
  }

  async delete(item: T): Promise<void> {
    const docRef = this.collection.doc(item.uid);
    await docRef.delete();
  }

  async findAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => doc.data() as T);
  }

  async findByUid(uid: string): Promise<T | null> {
    const docRef = this.collection.doc(uid);
    const doc = await docRef.get();

    console.log('doc: ', doc.data());
    return doc.exists ? (doc.data() as T) : null;
  }

  async findByEmail(email: string): Promise<T | null> {
    const snapshot = await this.collection.where('email', '==', email).get();
    return !snapshot.empty ? (snapshot.docs[0].data() as T) : null;
  }

  async getUserrole(uid: string): Promise<T | null> {
    const docRef = this.collection.doc(uid);
    const doc = await docRef.get();
    console.log('doc:--repo-getuserrole: ', doc.data());
    return doc.data() as T;
  }

  get lastestDoc() {
    return this.collection.orderBy('createdAt', 'desc').limit(1);
  }
}
