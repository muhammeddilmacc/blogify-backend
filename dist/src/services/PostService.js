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
import { PostRepository } from '../repositories/PostRepository.js';
import { Post } from '../models/Post.js';
import { FileService } from './FileService.js';
let PostService = class PostService {
    constructor(postRepository, fileService) {
        this.postRepository = postRepository;
        this.fileService = fileService;
    }
    async createPost(postData) {
        const post = new Post(postData.title, postData.content, postData.category, postData.excerpt, postData.author, postData.status, postData.image);
        return this.postRepository.create(post);
    }
    async updatePost(id, postData) {
        try {
            // Önce mevcut postu al
            const currentPost = await this.postRepository.findById(id);
            if (!currentPost) {
                throw new Error('Post bulunamadı');
            }
            // Eğer yeni bir resim yüklendiyse ve farklı bir resimse eski resmi sil
            if (postData.image?.url &&
                currentPost.image?.url &&
                postData.image.url !== currentPost.image.url) {
                try {
                    const oldFilename = this.fileService.extractFilenameFromUrl(currentPost.image.url);
                    await this.fileService.deleteFile(oldFilename);
                }
                catch (error) {
                    // Resim silme hatası güncellemeyi engellemeyecek
                    console.error('Eski resim silinirken hata:', error);
                }
            }
            // Güncellenecek veriyi hazırla
            const updateData = {
                ...currentPost,
                ...postData,
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
        if (post?.image?.url) {
            const filename = this.fileService.extractFilenameFromUrl(post.image.url);
            await this.fileService.deleteFile(filename);
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
    async getPublishedPosts(page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const filters = { status: 'published' };
        const [posts, totalItems] = await Promise.all([
            this.postRepository.findAllWithFilters(limit, skip, filters),
            this.postRepository.count(filters)
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
};
PostService = __decorate([
    injectable(),
    __param(0, inject(PostRepository)),
    __param(1, inject(FileService)),
    __metadata("design:paramtypes", [PostRepository,
        FileService])
], PostService);
export { PostService };
