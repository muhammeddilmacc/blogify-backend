import { Comment } from '@/models/Comment';
import { IBaseRepository } from './IBaseRepository';

export interface ICommentRepository extends IBaseRepository<Comment> {
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  getCommentsByUserId(userId: string): Promise<Comment[]>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  updateComment(commentId: string, userId: string, content: string): Promise<Comment>;
} 