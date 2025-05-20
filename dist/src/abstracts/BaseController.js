var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Logger } from '../utils/logger.js';
import { injectable } from 'inversify';
let BaseController = class BaseController {
    constructor() {
        this.logger = new Logger(this.constructor.name);
    }
    success(res, data) {
        res.status(200).json(data);
    }
    created(res, data) {
        res.status(201).json({
            message: 'Kayıt başarıyla oluşturuldu',
            data
        });
    }
    noContent(res) {
        res.status(204).send();
    }
    badRequest(res, message) {
        res.status(400).json({
            error: message
        });
    }
    unauthorized(res, message = 'Yetkisiz erişim') {
        res.status(401).json({
            error: message
        });
    }
    forbidden(res, message = 'Bu işlem için yetkiniz yok') {
        res.status(403).json({
            error: message
        });
    }
    notFound(res, message) {
        res.status(404).json({
            error: message
        });
    }
    handleError(error, res) {
        this.logger.error('İşlem hatası:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: error.message
            });
        }
        else {
            res.status(500).json({
                error: 'Beklenmeyen bir hata oluştu'
            });
        }
    }
};
BaseController = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], BaseController);
export { BaseController };
