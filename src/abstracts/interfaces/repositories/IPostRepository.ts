import { Post, CategoryType, PostStatus } from '@/models/Post';

export interface IPostRepository {
  create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  update(id: string, data: Partial<Post>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Post | null>;
  findAll(limit?: number, startAfterId?: string): Promise<{ items: Post[]; lastDoc: any }>;
  findAllWithFilters(
    limit?: number,
    skip?: number,
    filters?: Partial<Post>,
    search?: string,
    sortBy?: string
  ): Promise<{ items: Post[]; lastDoc: any }>;
  count(filters?: Partial<Post>, search?: string): Promise<number>;
  getPostsByAuthor(author: string): Promise<Post[]>;
  getPostsByCategory(category: CategoryType): Promise<Post[]>;
  getPostsByStatus(status: PostStatus): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPublishedPosts(limit?: number, startAfterId?: string): Promise<{ items: Post[]; lastDoc: any }>;
  searchPosts(searchTerm: string): Promise<Post[]>;
  getMostVisitedPost(): Promise<Post | null>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
}
