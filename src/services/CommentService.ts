import { inject, injectable } from 'inversify';
import { CommentRepository } from '../repositories/CommentRepository';
import { Comment } from '../models/Comment';
import { TYPES } from '../utils/types';
import { FirebaseAuthService } from './FirebaseAuthService';

interface CreateCommentDTO {
  content: string;
  postId: string;
  userId: string;
  userEmail: string;
  token: string;
}

interface UpdateCommentDTO {
  commentId: string;
  userId: string;
  content: string;
  token: string;
}

@injectable()
export class CommentService {
  constructor(
    @inject(TYPES.CommentRepository) private commentRepository: CommentRepository,
    @inject(FirebaseAuthService) private firebaseAuthService: FirebaseAuthService
  ) {}

  async createComment(data: CreateCommentDTO): Promise<Comment> {
    // Token doğrulama
    const user = await this.firebaseAuthService.verifyIdToken(data.token);
    if (!user || user.uid !== data.userId) {
      throw new Error('Unauthorized');
    }

    return this.commentRepository.create({
      content: data.content,
      postId: data.postId,
      userId: data.userId,
      userEmail: data.userEmail,
      uid: data.userId
    });
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return this.commentRepository.getCommentsByPostId(postId);
  }

  async getCommentsByUserId(userId: string): Promise<Comment[]> {
    return this.commentRepository.getCommentsByUserId(userId);
  }

  async deleteComment(commentId: string, userId: string, token: string): Promise<void> {
    // Token doğrulama
    const user = await this.firebaseAuthService.verifyIdToken(token);
    if (!user || user.uid !== userId) {
      throw new Error('Unauthorized');
    }

    return this.commentRepository.deleteComment(commentId, userId);
  }

  async updateComment(data: UpdateCommentDTO): Promise<Comment> {
    // Token doğrulama
    const user = await this.firebaseAuthService.verifyIdToken(data.token);
    if (!user || user.uid !== data.userId) {
      throw new Error('Unauthorized');
    }

    return this.commentRepository.updateComment(data.commentId, data.userId, data.content);
  }
} 