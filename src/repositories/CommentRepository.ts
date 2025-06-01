import { BaseFirestoreRepository } from '../abstracts/BaseFirestoreRepository';
import type { ICommentRepository } from '../abstracts/interfaces/repositories/ICommentRepository';
import { Comment } from '../models/Comment';
import { inject, injectable } from 'inversify';
import { Firestore, CollectionReference, FieldValue } from 'firebase-admin/firestore';
import { TYPES } from '../utils/types';

@injectable()
export class CommentRepository
  extends BaseFirestoreRepository<Comment>
{
  protected collection: CollectionReference<Comment>;

  constructor(
    @inject(TYPES.Firestore) db: Firestore,
    @inject(TYPES.CommentCollectionName) collectionName: string
  ) {
    super(collectionName, db);
    this.collection = db.collection(collectionName) as CollectionReference<Comment>;
  }

  async findByUid(uid: string): Promise<Comment | null> {
    const snapshot = await this.collection
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.mapDocToComment(snapshot.docs[0]);
  }

  override async create(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const docRef = this.collection.doc();
    const timestamp = FieldValue.serverTimestamp();
    
    const documentData = {
      ...data,
      id: docRef.id,
      uid: data.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as Comment;

    await docRef.set(documentData);
    return documentData;
  }

  private mapDocToComment(doc: FirebaseFirestore.DocumentSnapshot): Comment {
    const data = doc.data();
    if (!data) throw new Error('Document data is null');
    
    const comment = new Comment(
      data.content,
      data.postId,
      data.userId,
      data.userEmail
    );

    comment.id = doc.id;
    comment.uid = data.uid;
    comment.createdAt = data.createdAt?.toDate() || new Date();
    comment.updatedAt = data.updatedAt?.toDate() || new Date();
    
    return comment;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const snapshot = await this.collection
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => this.mapDocToComment(doc));
  }

  async getCommentsByUserId(userId: string): Promise<Comment[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => this.mapDocToComment(doc));
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const commentRef = this.collection.doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      throw new Error('Yorum bulunamadı');
    }

    const commentData = comment.data();
    if (commentData?.userId !== userId) {
      throw new Error('Bu yorumu silme yetkiniz yok');
    }

    await commentRef.delete();
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const commentRef = this.collection.doc(commentId);
    const comment = await commentRef.get();

    if (!comment.exists) {
      throw new Error('Yorum bulunamadı');
    }

    const commentData = comment.data();
    if (commentData?.userId !== userId) {
      throw new Error('Bu yorumu düzenleme yetkiniz yok');
    }

    const timestamp = FieldValue.serverTimestamp();
    await commentRef.update({
      content,
      updatedAt: timestamp
    });

    const updatedComment = await commentRef.get();
    return this.mapDocToComment(updatedComment);
  }
} 