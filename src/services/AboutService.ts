import { injectable, inject } from 'inversify';
import { db } from '../utils/config';
import { IAbout } from '../interfaces/IAbout';
import { CloudinaryService } from './CloudinaryService';
import { TYPES } from '@/utils/types';

@injectable()
export class AboutService {
  private readonly collection = 'about';

  constructor(
    @inject(TYPES.CloudinaryService) private cloudinaryService: CloudinaryService
  ) {}

  async getAbout(): Promise<IAbout | null> {
    try {
      const snapshot = await db.collection(this.collection).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as IAbout;
    } catch (error) {
      console.error('Error getting about:', error);
      throw error;
    }
  }

  async updateAbout(about: IAbout): Promise<IAbout> {
    try {
      const snapshot = await db.collection(this.collection).limit(1).get();
      const now = new Date();
      
      if (snapshot.empty) {
        // Create new document if none exists
        const docRef = await db.collection(this.collection).add({
          ...about,
          createdAt: now,
          updatedAt: now
        });
        return { id: docRef.id, ...about, createdAt: now, updatedAt: now };
      } else {
        // Update existing document
        const doc = snapshot.docs[0];
        const currentAbout = doc.data() as IAbout;

        // Eğer yeni bir resim yüklendiyse ve eski resimden farklıysa, eski resmi sil
        if (about.imageUrl && currentAbout.imageUrl && 
            about.imageUrl !== currentAbout.imageUrl && 
            currentAbout.imagePublicId) {
          await this.cloudinaryService.deleteImage(currentAbout.imagePublicId);
        }

        const updatedAbout = {
          ...about,
          updatedAt: now
        };
        await doc.ref.update(updatedAbout);
        return { id: doc.id, ...updatedAbout };
      }
    } catch (error) {
      console.error('Error updating about:', error);
      throw error;
    }
  }
} 