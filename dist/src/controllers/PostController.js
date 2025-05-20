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
import { inject, injectable } from 'inversify';
import { PostService } from '../services/PostService.js';
import { BaseController } from '../abstracts/BaseController.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import { TYPES } from '../utils/types.js';
let PostController = class PostController extends BaseController {
    constructor(postService, cloudinaryService) {
        super();
        this.postService = postService;
        this.cloudinaryService = cloudinaryService;
    }
    async uploadImage(req, res) {
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
        }
        catch (error) {
            console.error('UPLOAD - Error:', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
                errorStack: error instanceof Error ? error.stack : undefined,
            });
            this.handleError(error, res);
        }
    }
    async createPost(req, res) {
        try {
            const createdPost = await this.postService.createPost(req.body);
            this.created(res, { post: createdPost });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getPosts(req, res) {
        try {
            const { page = 1, limit = 10, category, status, search } = req.query;
            const validCategories = ['writing', 'poem', 'article'];
            const validStatuses = ['draft', 'published', 'archived'];
            const result = await this.postService.getAllPosts({
                page: Number(page),
                limit: Number(limit),
                category: category && validCategories.includes(category)
                    ? category
                    : undefined,
                status: status && validStatuses.includes(status)
                    ? status
                    : undefined,
                search: search,
            });
            this.success(res, result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getPublishedPosts(req, res) {
        try {
            const { page = 1, limit = 12, category, search, sortBy } = req.query;
            const validCategories = ['writing', 'poem', 'article'];
            const validSortOptions = ['date-desc', 'date-asc', 'views-desc', 'views-asc'];
            const result = await this.postService.getPublishedPosts({
                page: Number(page),
                limit: Number(limit),
                category: category && validCategories.includes(category)
                    ? category
                    : undefined,
                search: search,
                sortBy: sortBy && validSortOptions.includes(sortBy)
                    ? sortBy
                    : 'date-desc'
            });
            this.success(res, result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getPostById(req, res) {
        try {
            const { id } = req.params;
            const post = await this.postService.getPostById(id);
            if (!post) {
                this.notFound(res, 'Post bulunamadı');
                return;
            }
            this.success(res, post);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getPostsByCategory(req, res) {
        try {
            const { category } = req.params;
            if (!category || !['writing', 'poem', 'article'].includes(category)) {
                this.badRequest(res, 'Geçersiz kategori');
                return;
            }
            const posts = await this.postService.getPostsByCategory(category);
            this.success(res, { posts });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getPostBySlug(req, res) {
        try {
            const { slug } = req.params;
            const post = await this.postService.getPostBySlug(slug);
            if (!post) {
                this.notFound(res, 'Post bulunamadı');
                return;
            }
            this.success(res, post);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updatePost(req, res) {
        try {
            const { id } = req.params;
            // Mevcut postu al
            const currentPost = await this.postService.getPostById(id);
            if (!currentPost) {
                this.notFound(res, 'Post bulunamadı');
                return;
            }
            // Form verilerini parse et
            let updateData = { ...req.body };
            // Image verilerini parse et (eğer string olarak geldiyse)
            if (typeof updateData.image === 'string') {
                try {
                    updateData.image = JSON.parse(updateData.image);
                }
                catch (error) {
                    console.error('Image parse hatası:', error);
                }
            }
            try {
                await this.postService.updatePost(id, updateData);
            }
            catch (updateError) {
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
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Update hatası:', error.message);
            }
            this.handleError(error, res);
        }
    }
    async deletePost(req, res) {
        try {
            const { id } = req.params;
            await this.postService.deletePost(id);
            this.success(res, { message: 'Yazı başarıyla silindi' });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getMostSharedPosts(req, res) {
        try {
            const result = await this.postService.getMostSharedPosts();
            this.success(res, result);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async incrementShareCount(req, res) {
        try {
            const { id } = req.params;
            await this.postService.incrementShareCount(id);
            this.success(res, { message: 'Paylaşım sayısı güncellendi' });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async incrementViewCount(req, res) {
        try {
            const { id } = req.params;
            await this.postService.incrementViewCount(id);
            this.success(res, { message: 'Görüntülenme sayısı güncellendi' });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getMostVisitedPost(req, res) {
        try {
            const post = await this.postService.getMostVisitedPost();
            this.success(res, post);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
};
PostController = __decorate([
    injectable(),
    __param(0, inject(PostService)),
    __param(1, inject(TYPES.CloudinaryService)),
    __metadata("design:paramtypes", [PostService,
        CloudinaryService])
], PostController);
export { PostController };
