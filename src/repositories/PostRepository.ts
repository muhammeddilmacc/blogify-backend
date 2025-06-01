import { BaseFirestoreRepository } from '../abstracts/BaseFirestoreRepository';
import type { IPostRepository } from '../abstracts/interfaces/repositories/IPostRepository';
import { Post, PostStatus, CategoryType } from '../models/Post';
import { inject, injectable } from 'inversify';
import { Firestore, Query, DocumentData, CollectionReference, FieldValue } from 'firebase-admin/firestore';
import { TYPES } from '../utils/types';

@injectable()
export class PostRepository
  extends BaseFirestoreRepository<Post>
  implements IPostRepository
{
  protected collection: CollectionReference<Post>;

  constructor(
    @inject(TYPES.Firestore) db: Firestore,
    @inject(TYPES.PostCollectionName) collectionName: string
  ) {
    super(collectionName, db);
    this.collection = db.collection(collectionName) as CollectionReference<Post>;
  }

  override async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const docRef = this.collection.doc();
    const timestamp = FieldValue.serverTimestamp();
    
    const documentData = {
      ...data,
      id: docRef.id,
      views: 0,
      shareCount: 0,
      totalViewDuration: 0,
      searchableTitle: data.title.toLowerCase(),
      slug: new Post(
        data.title,
        data.content,
        data.category,
        data.excerpt,
        data.author
      ).createSlug(data.title),
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as Post;

    await docRef.set(documentData);
    return documentData;
  }

  private mapDocToPost(doc: FirebaseFirestore.DocumentSnapshot): Post {
    const data = doc.data();
    if (!data) throw new Error('Document data is null');
    
    const post = new Post(
      data.title,
      data.content,
      data.category,
      data.excerpt,
      data.author,
      data.status,
      data.image,
      data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
    );

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

  override async findAll(limit: number = 10, startAfterId?: string): Promise<{ items: Post[]; lastDoc: any }> {
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

  async findAllWithFilters(
    limit: number = 10,
    skip: number = 0,
    filters: Partial<Post> = {},
    search?: string,
    sortBy: string = 'date-desc'
  ): Promise<{ items: Post[]; lastDoc: any }> {
    let baseQuery = this.collection as Query<Post>;

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

  async count(filters: Partial<Post> = {}, search?: string): Promise<number> {
    let countQuery = this.collection as Query<Post>;

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

  async getPostsByAuthor(author: string): Promise<Post[]> {
    const snapshot = await this.collection
      .where('author', '==', author)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(this.mapDocToPost);
  }

  async getPostsByCategory(category: CategoryType): Promise<Post[]> {
    const snapshot = await this.collection
      .where('category', '==', category)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(this.mapDocToPost);
  }

  async getPostsByStatus(status: PostStatus): Promise<Post[]> {
    const snapshot = await this.collection
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(this.mapDocToPost);
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const snapshot = await this.collection
      .where('slug', '==', slug)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (!doc?.exists) return null;

    return this.mapDocToPost(doc);
  }

  async getPublishedPosts(limit: number = 10, startAfterId?: string): Promise<{ items: Post[]; lastDoc: any }> {
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

  async searchPosts(searchTerm: string): Promise<Post[]> {
    const snapshot = await this.collection
      .where('status', '==', 'published')
      .orderBy('title')
      .startAt(searchTerm)
      .endAt(searchTerm + '\uf8ff')
      .get();

    return snapshot.docs.map(this.mapDocToPost);
  }

  async getMostVisitedPost(): Promise<Post | null> {
    const snapshot = await this.collection
      .orderBy('views', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return this.mapDocToPost(snapshot.docs[0]);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const postRef = this.collection.doc(postId);
    await this.db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) {
        throw new Error('Post bulunamadı');
      }

      const post = postDoc.data() as Post;
      const likedBy = post.likedBy || [];

      if (likedBy.includes(userId)) {
        throw new Error('Post zaten beğenilmiş');
      }

      transaction.update(postRef, {
        likes: FieldValue.increment(1),
        likedBy: FieldValue.arrayUnion(userId),
        updatedAt: FieldValue.serverTimestamp()
      });
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const postRef = this.collection.doc(postId);
    await this.db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) {
        throw new Error('Post bulunamadı');
      }

      const post = postDoc.data() as Post;
      const likedBy = post.likedBy || [];

      if (!likedBy.includes(userId)) {
        throw new Error('Post zaten beğenilmemiş');
      }

      transaction.update(postRef, {
        likes: FieldValue.increment(-1),
        likedBy: FieldValue.arrayRemove(userId),
        updatedAt: FieldValue.serverTimestamp()
      });
    });
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const postDoc = await this.collection.doc(postId).get();
    if (!postDoc.exists) {
      throw new Error('Post bulunamadı');
    }

    const post = postDoc.data() as Post;
    return (post.likedBy || []).includes(userId);
  }
}
