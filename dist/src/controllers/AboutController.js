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
import { injectable, inject } from 'inversify';
import { AboutService } from '../services/AboutService.js';
import { BaseController } from '../abstracts/BaseController.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import { TYPES } from '../utils/types.js';
let AboutController = class AboutController extends BaseController {
    constructor(aboutService, cloudinaryService) {
        super();
        this.aboutService = aboutService;
        this.cloudinaryService = cloudinaryService;
    }
    async getAbout(req, res) {
        try {
            const about = await this.aboutService.getAbout();
            this.success(res, about);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateAbout(req, res) {
        try {
            const file = req.file;
            let imageUrl = '';
            let imagePublicId = '';
            if (file) {
                const uploadResult = await this.cloudinaryService.uploadImage(file);
                imageUrl = uploadResult.url;
                imagePublicId = uploadResult.publicId;
            }
            const aboutData = {
                name: req.body.name,
                description: req.body.description,
                imageUrl: imageUrl || req.body.imageUrl,
                imagePublicId: imagePublicId || req.body.imagePublicId
            };
            const updatedAbout = await this.aboutService.updateAbout(aboutData);
            this.success(res, updatedAbout);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
};
AboutController = __decorate([
    injectable(),
    __param(0, inject(AboutService)),
    __param(1, inject(TYPES.CloudinaryService)),
    __metadata("design:paramtypes", [AboutService,
        CloudinaryService])
], AboutController);
export { AboutController };
