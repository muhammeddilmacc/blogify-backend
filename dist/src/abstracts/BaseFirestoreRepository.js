var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { injectable } from 'inversify';
let BaseFirestoreRepository = class BaseFirestoreRepository {
    constructor(collectionName, db) {
        this.db = db;
        this.collection = this.db.collection(collectionName);
    }
    async create(data) {
        const docRef = this.collection.doc();
        const timestamp = FieldValue.serverTimestamp();
        const documentData = {
            ...data,
            id: docRef.id,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await docRef.set(documentData);
        return documentData;
    }
    async update(id, data) {
        console.log('REPOSITORY - Update Started:', { id, data });
        try {
            // Null veya undefined değerleri kaldır
            const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            console.log('REPOSITORY - Cleaned Data:', cleanData);
            const timestamp = FieldValue.serverTimestamp();
            const updateData = {
                ...cleanData,
                updatedAt: timestamp,
            };
            console.log('REPOSITORY - Final Update Data:', updateData);
            await this.collection.doc(id).update(updateData);
            console.log('REPOSITORY - Update Completed Successfully');
        }
        catch (error) {
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
    async delete(id) {
        await this.collection.doc(id).delete();
    }
    async findById(id) {
        const doc = await this.collection.doc(id).get();
        return doc.exists ? doc.data() : null;
    }
    async findAll(limit = 10, startAfterId) {
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
        const items = snapshot.docs.map(doc => doc.data());
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        return { items, lastDoc };
    }
    async findWhere(field, operator, value) {
        const snapshot = await this.collection
            .where(field, operator, value)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
};
BaseFirestoreRepository = __decorate([
    injectable(),
    __metadata("design:paramtypes", [String, Firestore])
], BaseFirestoreRepository);
export { BaseFirestoreRepository };
