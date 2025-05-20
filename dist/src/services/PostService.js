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
import { Post } from '../models/Post.js';
import { FileService } from './FileService.js';
import { TYPES } from '../utils/types.js';
import { CloudinaryService } from './CloudinaryService.js';
let PostService = class PostService {
    constructor(postRepository, fileService, cloudinaryService) {
        this.postRepository = postRepository;
        this.fileService = fileService;
        this.cloudinaryService = cloudinaryService;
    }
    async createPost(postData) {
        const post = new Post(postData.title, postData.content, postData.category, postData.excerpt, postData.author, postData.status, postData.image);
        return this.postRepository.create(post);
    }
    async updatePost(id, postData) {
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
                }
                catch (error) {
                    console.error('Eski resim silinirken hata:', error);
                }
            }
            // Başlık değiştiyse yeni slug oluştur
            if (postData.title && postData.title !== currentPost.title) {
                const post = new Post(postData.title, currentPost.content, currentPost.category, currentPost.excerpt, currentPost.author);
                postData.slug = post.createSlug(postData.title);
                postData.searchableTitle = postData.title.toLowerCase();
            }
            // Güncellenecek veriyi hazırla
            const updateData = {
                ...currentPost,
                ...postData,
                // Özel alanları koru
                views: currentPost.views,
                shareCount: currentPost.shareCount,
                totalViewDuration: currentPost.totalViewDuration,
                lastViewedAt: currentPost.lastViewedAt
            };
            // id, createdAt ve updatedAt alanlarını çıkar
            delete updateData.id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.imagePreview;
            try {
                await this.postRepository.update(id, updateData);
            }
            catch (error) {
                throw new Error(`Veritabanı güncelleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            }
        }
        catch (error) {
            throw error;
        }
    }
    async deletePost(id) {
        const post = await this.postRepository.findById(id);
        if (post?.image?.publicId) {
            await this.cloudinaryService.deleteImage(post.image.publicId);
        }
        await this.postRepository.delete(id);
    }
    async getPostById(id) {
        return this.postRepository.findById(id);
    }
    async getPostBySlug(slug) {
        return this.postRepository.getPostBySlug(slug);
    }
    async getAllPosts(options) {
        const { page = 1, limit = 12, category, status, search } = options;
        const skip = (page - 1) * limit;
        let filters = {};
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
    async getPublishedPosts(options) {
        const { page = 1, limit = 12, category, search, sortBy = 'date-desc' } = options;
        const skip = (page - 1) * limit;
        const filters = { status: 'published' };
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
    async getPostsByCategory(category) {
        return this.postRepository.getPostsByCategory(category);
    }
    async getPostsByAuthor(author) {
        return this.postRepository.getPostsByAuthor(author);
    }
    async searchPosts(searchTerm) {
        return this.postRepository.searchPosts(searchTerm);
    }
    async getPageStartId(page, limit) {
        if (page <= 1)
            return undefined;
        const startIndex = (page - 1) * limit - 1;
        const { items } = await this.postRepository.findAll(startIndex + 1);
        return items[startIndex]?.id;
    }
    async getMostSharedPosts() {
        const limit = 3; // En çok paylaşılan 3 postu getir
        const page = 1;
        const skip = 0;
        const filters = { status: 'published' };
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
    async incrementShareCount(id) {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new Error('Post bulunamadı');
        }
        const updateData = {
            shareCount: (post.shareCount || 0) + 1
        };
        await this.postRepository.update(id, updateData);
    }
    async incrementViewCount(id) {
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
    async getMostVisitedPost() {
        return this.postRepository.getMostVisitedPost();
    }
};
PostService = __decorate([
    injectable(),
    __param(0, inject(TYPES.PostRepository)),
    __param(1, inject(FileService)),
    __param(2, inject(TYPES.CloudinaryService)),
    __metadata("design:paramtypes", [Object, FileService,
        CloudinaryService])
], PostService);
export { PostService };
