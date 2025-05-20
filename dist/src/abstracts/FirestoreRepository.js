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
import { injectable, unmanaged } from 'inversify';
import { db } from '../utils/config.js';
let FirestoreRepository = class FirestoreRepository {
    constructor(collectionName) {
        this.collection = db.collection(collectionName);
    }
    async create(item) {
        console.log('item.uid: ', item.uid);
        const docRef = item.uid
            ? this.collection.doc(item.uid)
            : this.collection.doc();
        console.log('docRef: ', docRef);
        await docRef.set(item);
    }
    async update(item) {
        const docRef = this.collection.doc(item.uid);
        await docRef.update(item);
    }
    async delete(item) {
        const docRef = this.collection.doc(item.uid);
        await docRef.delete();
    }
    async findAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map((doc) => doc.data());
    }
    async findByUid(uid) {
        const docRef = this.collection.doc(uid);
        const doc = await docRef.get();
        console.log('doc: ', doc.data());
        return doc.exists ? doc.data() : null;
    }
    async findByEmail(email) {
        const snapshot = await this.collection.where('email', '==', email).get();
        return !snapshot.empty ? snapshot.docs[0].data() : null;
    }
    async getUserrole(uid) {
        const docRef = this.collection.doc(uid);
        const doc = await docRef.get();
        console.log('doc:--repo-getuserrole: ', doc.data());
        return doc.data();
    }
    get lastestDoc() {
        return this.collection.orderBy('createdAt', 'desc').limit(1);
    }
};
FirestoreRepository = __decorate([
    injectable(),
    __param(0, unmanaged()),
    __metadata("design:paramtypes", [String])
], FirestoreRepository);
export { FirestoreRepository };
