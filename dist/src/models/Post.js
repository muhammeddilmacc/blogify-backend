var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsEnum, IsObject, IsNumber, IsDate, IsOptional } from 'class-validator';
export class Post {
    constructor(title, content, category, excerpt, author, status = 'draft', image = { url: '', alt: '' }, date) {
        this.views = 0;
        this.shareCount = 0;
        this.totalViewDuration = 0; // saniye cinsinden
        this.title = title;
        this.searchableTitle = title.toLowerCase();
        this.content = content;
        this.category = category;
        this.excerpt = excerpt;
        this.image = image;
        this.status = status;
        this.author = author;
        this.slug = this.createSlug(title);
        this.date = date || new Date().toISOString();
        this.views = 0;
        this.shareCount = 0;
        this.totalViewDuration = 0;
    }
    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    updateTitle(newTitle) {
        this.title = newTitle;
        this.searchableTitle = newTitle.toLowerCase();
        this.slug = this.createSlug(newTitle);
    }
}
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "searchableTitle", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], Post.prototype, "views", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], Post.prototype, "shareCount", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], Post.prototype, "totalViewDuration", void 0);
__decorate([
    IsDate(),
    IsOptional(),
    __metadata("design:type", Date)
], Post.prototype, "lastViewedAt", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    IsEnum(['writing', 'poem', 'article']),
    __metadata("design:type", String)
], Post.prototype, "category", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "excerpt", void 0);
__decorate([
    IsObject(),
    __metadata("design:type", Object)
], Post.prototype, "image", void 0);
__decorate([
    IsEnum(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "author", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], Post.prototype, "date", void 0);
