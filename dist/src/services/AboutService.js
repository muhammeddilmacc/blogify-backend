var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { injectable, inject } from 'inversify';
import { db } from '../utils/config.js';
import { FileService } from './FileService.js';
let AboutService = class AboutService {
    constructor(fileService) {
        this.fileService = fileService;
        this.collection = 'about';
    }
    async getAbout() {
        try {
            const snapshot = await db.collection(this.collection).limit(1).get();
            if (snapshot.empty) {
                return null;
            }
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        catch (error) {
            console.error('Error getting about:', error);
            throw error;
        }
    }
    async updateAbout(about) {
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
            }
            else {
                // Update existing document
                const doc = snapshot.docs[0];
                const currentAbout = doc.data();
                // Eğer yeni bir resim yüklendiyse ve eski resimden farklıysa, eski resmi sil
                if (about.imageUrl && currentAbout.imageUrl && about.imageUrl !== currentAbout.imageUrl) {
                    const oldFilename = this.fileService.extractFilenameFromUrl(currentAbout.imageUrl);
                    await this.fileService.deleteFile(oldFilename);
                }
                const updatedAbout = {
                    ...about,
                    updatedAt: now
                };
                await doc.ref.update(updatedAbout);
                return { id: doc.id, ...updatedAbout };
            }
        }
        catch (error) {
            console.error('Error updating about:', error);
            throw error;
        }
    }
};
AboutService = __decorate([
    injectable(),
    __param(0, inject(FileService)),
    __metadata("design:paramtypes", [FileService])
], AboutService);
export { AboutService };
