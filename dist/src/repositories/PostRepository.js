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
import { BaseFirestoreRepository } from '../abstracts/BaseFirestoreRepository.js';
import { Post } from '../models/Post.js';
import { inject, injectable } from 'inversify';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { TYPES } from '../utils/types.js';
let PostRepository = class PostRepository extends BaseFirestoreRepository {
    constructor(db, collectionName) {
        super(collectionName, db);
        this.collection = db.collection(collectionName);
    }
    async create(data) {
        const docRef = this.collection.doc();
        const timestamp = FieldValue.serverTimestamp();
        const documentData = {
            ...data,
            id: docRef.id,
            views: 0,
            shareCount: 0,
            totalViewDuration: 0,
            searchableTitle: data.title.toLowerCase(),
            slug: new Post(data.title, data.content, data.category, data.excerpt, data.author).createSlug(data.title),
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await docRef.set(documentData);
        return documentData;
    }
    mapDocToPost(doc) {
        const data = doc.data();
        if (!data)
            throw new Error('Document data is null');
        const post = new Post(data.title, data.content, data.category, data.excerpt, data.author, data.status, data.image, data.createdAt?.toDate()?.toISOString() || new Date().toISOString());
        post.id = doc.id;
        post.views = data.views || 0;
        post.shareCount = data.shareCount || 0;
        post.totalViewDuration = data.totalViewDuration || 0;
        post.searchableTitle = data.searchableTitle || data.title.toLowerCase();
        post.slug = data.slug || post.createSlug(data.title);
        post.lastViewedAt = data.lastViewedAt?.toDate() || undefined;
        post.date = data.date || data.createdAt?.toDate()?.toISOString() || new Date().toISOString();
        return post;
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
        const items = snapshot.docs.map(this.mapDocToPost);
        return {
            items,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    }
    async findAllWithFilters(limit = 10, skip = 0, filters = {}, search, sortBy = 'date-desc') {
        let baseQuery = this.collection;
        if (filters.category) {
            baseQuery = baseQuery.where('category', '==', filters.category);
        }
        if (filters.status) {
            baseQuery = baseQuery.where('status', '==', filters.status);
        }
        switch (sortBy) {
            case 'date-desc':
                baseQuery = baseQuery.orderBy('createdAt', 'desc');
                break;
            case 'date-asc':
                baseQuery = baseQuery.orderBy('createdAt', 'asc');
                break;
            case 'views-desc':
                baseQuery = baseQuery.orderBy('views', 'desc').orderBy('createdAt', 'desc');
                break;
            case 'views-asc':
                baseQuery = baseQuery.orderBy('views', 'asc').orderBy('createdAt', 'desc');
                break;
            case 'shareCount-desc':
                baseQuery = baseQuery.orderBy('shareCount', 'desc').orderBy('createdAt', 'desc');
                break;
            case 'shareCount-asc':
                baseQuery = baseQuery.orderBy('shareCount', 'asc').orderBy('createdAt', 'desc');
                break;
            default:
                baseQuery = baseQuery.orderBy('createdAt', 'desc');
        }
        if (search) {
            const searchLower = search.toLowerCase();
            baseQuery = baseQuery.where('searchableTitle', '>=', searchLower)
                .where('searchableTitle', '<=', searchLower + '\uf8ff');
        }
        const totalQuery = baseQuery.get();
        const totalDocs = (await totalQuery).docs;
        if (skip > 0 && skip < totalDocs.length) {
            baseQuery = baseQuery.startAfter(totalDocs[skip - 1]);
        }
        const finalQuery = baseQuery.limit(limit);
        const snapshot = await finalQuery.get();
        const items = snapshot.docs.map(this.mapDocToPost);
        return {
            items,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    }
    async count(filters = {}, search) {
        let countQuery = this.collection;
        if (filters.category) {
            countQuery = countQuery.where('category', '==', filters.category);
        }
        if (filters.status) {
            countQuery = countQuery.where('status', '==', filters.status);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            countQuery = countQuery.where('searchableTitle', '>=', searchLower)
                .where('searchableTitle', '<=', searchLower + '\uf8ff');
        }
        const snapshot = await countQuery.count().get();
        return snapshot.data().count;
    }
    async getPostsByAuthor(author) {
        const snapshot = await this.collection
            .where('author', '==', author)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(this.mapDocToPost);
    }
    async getPostsByCategory(category) {
        const snapshot = await this.collection
            .where('category', '==', category)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(this.mapDocToPost);
    }
    async getPostsByStatus(status) {
        const snapshot = await this.collection
            .where('status', '==', status)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(this.mapDocToPost);
    }
    async getPostBySlug(slug) {
        const snapshot = await this.collection
            .where('slug', '==', slug)
            .limit(1)
            .get();
        const doc = snapshot.docs[0];
        if (!doc?.exists)
            return null;
        return this.mapDocToPost(doc);
    }
    async getPublishedPosts(limit = 10, startAfterId) {
        let query = this.collection
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .limit(limit);
        if (startAfterId) {
            const startAfterDoc = await this.collection.doc(startAfterId).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }
        const snapshot = await query.get();
        const items = snapshot.docs.map(this.mapDocToPost);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        return { items, lastDoc };
    }
    async searchPosts(searchTerm) {
        const snapshot = await this.collection
            .where('status', '==', 'published')
            .orderBy('title')
            .startAt(searchTerm)
            .endAt(searchTerm + '\uf8ff')
            .get();
        return snapshot.docs.map(this.mapDocToPost);
    }
    async getMostVisitedPost() {
        const snapshot = await this.collection
            .orderBy('views', 'desc')
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return this.mapDocToPost(snapshot.docs[0]);
    }
};
PostRepository = __decorate([
    injectable(),
    __param(0, inject(TYPES.Firestore)),
    __param(1, inject(TYPES.PostCollectionName)),
    __metadata("design:paramtypes", [Firestore, String])
], PostRepository);
export { PostRepository };
