import { inject, injectable } from 'inversify';
import { PostRepository } from '@/repositories/PostRepository';
import { Post, PostStatus, CategoryType } from '@/models/Post';
import { FileService } from './FileService';
import { IPostRepository } from '@/abstracts/interfaces/repositories/IPostRepository';
import { TYPES } from '@/utils/types';
import { CloudinaryService } from './CloudinaryService';

interface CreatePostDTO {
  title: string;
  content: string;
  category: CategoryType;
  excerpt: string;
  author: string;
  status?: PostStatus;
  image?: {
    url: string;
    alt: string;
  };
}

interface UpdatePostDTO {
  title?: string;
  content?: string;
  category?: CategoryType;
  excerpt?: string;
  status?: PostStatus;
  image?: {
    url: string;
    alt: string;
  };
  slug?: string;
  searchableTitle?: string;
  views?: number;
  shareCount?: number;
  totalViewDuration?: number;
  lastViewedAt?: Date;
}

interface GetPostsOptions {
  page: number;
  limit: number;
  category?: CategoryType;
  status?: PostStatus;
  search?: string;
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GetPublishedPostsOptions {
  page: number;
  limit: number;
  category?: CategoryType;
  search?: string;
  sortBy?: string;
}

@injectable()
export class PostService {
  constructor(
    @inject(TYPES.PostRepository) private postRepository: IPostRepository,
    @inject(FileService) private fileService: FileService,
    @inject(TYPES.CloudinaryService) private cloudinaryService: CloudinaryService
  ) {}

  async createPost(postData: CreatePostDTO): Promise<Post> {
    const post = new Post(
      postData.title,
      postData.content,
      postData.category,
      postData.excerpt,
      postData.author,
      postData.status,
      postData.image
    );

    return this.postRepository.create(post);
  }

  async updatePost(id: string, postData: UpdatePostDTO): Promise<void> {
    try {
      const currentPost = await this.postRepository.findById(id);
      
      if (!currentPost) {
        throw new Error('Post bulunamadı');
      }

      // Eğer yeni bir resim yüklendiyse ve farklı bir resimse eski resmi sil
      if (postData.image?.url && 
          currentPost.image?.url && 
          postData.image.url !== currentPost.image.url &&
          currentPost.image.publicId) {
        try {
          await this.cloudinaryService.deleteImage(currentPost.image.publicId);
        } catch (error) {
          console.error('Eski resim silinirken hata:', error);
        }
      }

      // Başlık değiştiyse yeni slug oluştur
      if (postData.title && postData.title !== currentPost.title) {
        const post = new Post(
          postData.title,
          currentPost.content,
          currentPost.category,
          currentPost.excerpt,
          currentPost.author
        );
        postData.slug = post.createSlug(postData.title);
        postData.searchableTitle = postData.title.toLowerCase();
      }

      // Güncellenecek veriyi hazırla
      const updateData: UpdatePostDTO = {
        ...currentPost,
        ...postData,
        // Özel alanları koru
        views: currentPost.views,
        shareCount: currentPost.shareCount,
        totalViewDuration: currentPost.totalViewDuration,
        lastViewedAt: currentPost.lastViewedAt
      };

      // id, createdAt ve updatedAt alanlarını çıkar
      delete (updateData as any).id;
      delete (updateData as any).createdAt;
      delete (updateData as any).updatedAt;
      delete (updateData as any).imagePreview;

      try {
        await this.postRepository.update(id, updateData);
      } catch (error) {
        throw new Error(`Veritabanı güncelleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (post?.image?.publicId) {
      await this.cloudinaryService.deleteImage(post.image.publicId);
    }
    await this.postRepository.delete(id);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.postRepository.findById(id);
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    return this.postRepository.getPostBySlug(slug);
  }

  async getAllPosts(options: GetPostsOptions): Promise<PaginationResult<Post>> {
    const { page = 1, limit = 12, category, status, search } = options;
    const skip = (page - 1) * limit;

    let filters: Partial<Post> = {};
    if (category) {
      filters.category = category;
    }
    if (status) {
      filters.status = status;
    }

    const [posts, totalItems] = await Promise.all([
      this.postRepository.findAllWithFilters(limit, skip, filters, search),
      this.postRepository.count(filters, search)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: posts.items,
      total: totalItems,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  async getPublishedPosts(options: GetPublishedPostsOptions): Promise<PaginationResult<Post>> {
    const { page = 1, limit = 12, category, search, sortBy = 'date-desc' } = options;
    const skip = (page - 1) * limit;
    const filters: Partial<Post> = { status: 'published' as PostStatus };

    if (category) {
      filters.category = category;
    }

    const [posts, totalItems] = await Promise.all([
      this.postRepository.findAllWithFilters(limit, skip, filters, search, sortBy),
      this.postRepository.count(filters, search)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: posts.items,
      total: totalItems,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  async getPostsByCategory(category: CategoryType): Promise<Post[]> {
    return this.postRepository.getPostsByCategory(category);
  }

  async getPostsByAuthor(author: string): Promise<Post[]> {
    return this.postRepository.getPostsByAuthor(author);
  }

  async searchPosts(searchTerm: string): Promise<Post[]> {
    return this.postRepository.searchPosts(searchTerm);
  }

  private async getPageStartId(page: number, limit: number): Promise<string | undefined> {
    if (page <= 1) return undefined;
    
    const startIndex = (page - 1) * limit - 1;
    const { items } = await this.postRepository.findAll(startIndex + 1);
    
    return items[startIndex]?.id;
  }

  async getMostSharedPosts(): Promise<PaginationResult<Post>> {
    const limit = 3; // En çok paylaşılan 3 postu getir
    const page = 1;
    const skip = 0;
    const filters: Partial<Post> = { status: 'published' as PostStatus };

    const [posts, totalItems] = await Promise.all([
      this.postRepository.findAllWithFilters(limit, skip, filters, undefined, 'shareCount-desc'),
      this.postRepository.count(filters)
    ]);

    return {
      data: posts.items,
      total: totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: false,
      hasPreviousPage: false
    };
  }

  async incrementShareCount(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error('Post bulunamadı');
    }

    const updateData = {
      shareCount: (post.shareCount || 0) + 1
    };

    await this.postRepository.update(id, updateData);
  }

  async incrementViewCount(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error('Post bulunamadı');
    }

    const updateData = {
      views: (post.views || 0) + 1,
      lastViewedAt: new Date()
    };

    await this.postRepository.update(id, updateData);
  }

  async getMostVisitedPost(): Promise<Post | null> {
    const posts = await this.postRepository.findAllWithFilters(1, 0, { status: 'published' }, undefined, 'views-desc');
    return posts.items[0] || null;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      await this.postRepository.likePost(postId, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Beğeni işlemi başarısız: ${error.message}`);
      }
      throw new Error('Beğeni işlemi sırasında bir hata oluştu');
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      await this.postRepository.unlikePost(postId, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Beğeni kaldırma işlemi başarısız: ${error.message}`);
      }
      throw new Error('Beğeni kaldırma işlemi sırasında bir hata oluştu');
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    try {
      return await this.postRepository.isPostLikedByUser(postId, userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Beğeni durumu kontrolü başarısız: ${error.message}`);
      }
      throw new Error('Beğeni durumu kontrolü sırasında bir hata oluştu');
    }
  }

  async getMostLikedPosts(): Promise<PaginationResult<Post>> {
    const limit = 3; // En çok beğenilen 3 postu getir
    const page = 1;
    const skip = 0;
    const filters: Partial<Post> = { status: 'published' as PostStatus };

    const [posts, totalItems] = await Promise.all([
      this.postRepository.findAllWithFilters(limit, skip, filters, undefined, 'likes-desc'),
      this.postRepository.count(filters)
    ]);

    return {
      data: posts.items,
      total: totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: false,
      hasPreviousPage: false
    };
  }
}
