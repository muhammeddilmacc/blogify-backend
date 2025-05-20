// controllers/UserController.ts
import type { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { PostService } from '@/services/PostService';
import { BaseController } from '@/abstracts/BaseController';
import { CategoryType, PostStatus } from '@/models/Post';
import { CloudinaryService } from '@/services/CloudinaryService';
import { TYPES } from '@/utils/types';

@injectable()
export class PostController extends BaseController {
  constructor(
    @inject(PostService) private postService: PostService,
    @inject(TYPES.CloudinaryService) private cloudinaryService: CloudinaryService
  ) {
    super();
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      console.log('UPLOAD - Request received:', {
        file: req.file,
        body: req.body,
      });

      if (!req.file) {
        console.log('UPLOAD - No file received');
        this.badRequest(res, 'Lütfen bir resim yükleyin.');
        return;
      }

      // Cloudinary'ye yükle
      const { url, publicId } = await this.cloudinaryService.uploadImage(req.file);

      console.log('UPLOAD - Image uploaded to Cloudinary:', { url, publicId });

      const response = {
        url,
        alt: req.file.originalname,
        publicId
      };

      console.log('UPLOAD - Sending response:', response);
      this.success(res, response);
    } catch (error) {
      console.error('UPLOAD - Error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      this.handleError(error, res);
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const createdPost = await this.postService.createPost(req.body);
      this.created(res, { post: createdPost });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      const validCategories = ['writing', 'poem', 'article'] as const;
      const validStatuses = ['draft', 'published', 'archived'] as const;

      const result = await this.postService.getAllPosts({
        page: Number(page),
        limit: Number(limit),
        category:
          category && validCategories.includes(category as any)
            ? (category as CategoryType)
            : undefined,
        status:
          status && validStatuses.includes(status as any)
            ? (status as PostStatus)
            : undefined,
        search: search as string,
      });

      this.success(res, result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPublishedPosts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 12, category, search, sortBy } = req.query;
      const validCategories = ['writing', 'poem', 'article'] as const;
      const validSortOptions = ['date-desc', 'date-asc', 'views-desc', 'views-asc'] as const;

      const result = await this.postService.getPublishedPosts({
        page: Number(page),
        limit: Number(limit),
        category: category && validCategories.includes(category as any)
          ? (category as CategoryType)
          : undefined,
        search: search as string,
        sortBy: sortBy && validSortOptions.includes(sortBy as any)
          ? (sortBy as string)
          : 'date-desc'
      });
      
      this.success(res, result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(id);

      if (!post) {
        this.notFound(res, 'Post bulunamadı');
        return;
      }

      this.success(res, post);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPostsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;

      if (!category || !['writing', 'poem', 'article'].includes(category)) {
        this.badRequest(res, 'Geçersiz kategori');
        return;
      }

      const posts = await this.postService.getPostsByCategory(
        category as CategoryType,
      );
      this.success(res, { posts });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const post = await this.postService.getPostBySlug(slug);

      if (!post) {
        this.notFound(res, 'Post bulunamadı');
        return;
      }

      this.success(res, post);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Mevcut postu al
      const currentPost = await this.postService.getPostById(id);

      if (!currentPost) {
        this.notFound(res, 'Post bulunamadı');
        return;
      }

      // Form verilerini parse et
      let updateData: any = { ...req.body };

      // Image verilerini parse et (eğer string olarak geldiyse)
      if (typeof updateData.image === 'string') {
        try {
          updateData.image = JSON.parse(updateData.image);
        } catch (error) {
          console.error('Image parse hatası:', error);
        }
      }

      try {
        await this.postService.updatePost(id, updateData);
      } catch (updateError) {
        throw updateError;
      }

      // Güncellenmiş postu al
      const updatedPost = await this.postService.getPostById(id);

      if (!updatedPost) {
        this.notFound(res, 'Post bulunamadı');
        return;
      }

      this.success(res, {
        post: updatedPost,
        message: 'Yazı başarıyla güncellendi',
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Update hatası:', error.message);
      }
      this.handleError(error, res);
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.postService.deletePost(id);
      this.success(res, { message: 'Yazı başarıyla silindi' });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getMostSharedPosts(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.postService.getMostSharedPosts();
      this.success(res, result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async incrementShareCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.postService.incrementShareCount(id);
      this.success(res, { message: 'Paylaşım sayısı güncellendi' });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async incrementViewCount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.postService.incrementViewCount(id);
      this.success(res, { message: 'Görüntülenme sayısı güncellendi' });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getMostVisitedPost(req: Request, res: Response): Promise<void> {
    try {
      const post = await this.postService.getMostVisitedPost();
      this.success(res, post);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
