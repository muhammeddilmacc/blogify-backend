var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from 'inversify';
import { db } from '../utils/config.js';
import { FieldValue } from 'firebase-admin/firestore';
let ContactRepository = class ContactRepository {
    constructor() {
        this.collectionName = 'contacts';
    }
    async getContact() {
        const snapshot = await db.collection(this.collectionName).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async updateContact(contact) {
        const docRef = db.collection(this.collectionName).doc(contact.id);
        const updateData = {
            ...contact,
            updatedAt: FieldValue.serverTimestamp(),
        };
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
    async createContact(contact) {
        const docRef = await db.collection(this.collectionName).add({
            ...contact,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }
};
ContactRepository = __decorate([
    injectable()
], ContactRepository);
export { ContactRepository };
