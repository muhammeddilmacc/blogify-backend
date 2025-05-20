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
import { ContactService } from '../services/ContactService.js';
import { BaseController } from '../abstracts/BaseController.js';
import { TYPES } from '../utils/types.js';
let ContactController = class ContactController extends BaseController {
    constructor(contactService) {
        super();
        this.contactService = contactService;
    }
    async getContact(req, res) {
        try {
            const contact = await this.contactService.getContact();
            this.success(res, contact);
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateContact(req, res) {
        try {
            const contactData = req.body;
            const updatedContact = await this.contactService.updateContact(contactData);
            this.success(res, { contact: updatedContact, message: 'İletişim bilgileri başarıyla güncellendi' });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Contact information not found') {
                this.notFound(res, 'İletişim bilgileri bulunamadı');
                return;
            }
            this.handleError(error, res);
        }
    }
    async createContact(req, res) {
        try {
            const contactData = req.body;
            const newContact = await this.contactService.createContact(contactData);
            this.created(res, { contact: newContact });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Contact information already exists') {
                this.badRequest(res, 'İletişim bilgileri zaten mevcut');
                return;
            }
            this.handleError(error, res);
        }
    }
};
ContactController = __decorate([
    injectable(),
    __param(0, inject(TYPES.ContactService)),
    __metadata("design:paramtypes", [ContactService])
], ContactController);
export { ContactController };
