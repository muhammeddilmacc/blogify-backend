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
import { Contact } from '../models/Contact.js';
import { TYPES } from '../utils/types.js';
let ContactService = class ContactService {
    constructor(contactRepository) {
        this.contactRepository = contactRepository;
    }
    async getContact() {
        return this.contactRepository.getContact();
    }
    async updateContact(contactData) {
        const existingContact = await this.contactRepository.getContact();
        if (!existingContact) {
            throw new Error('Contact information not found');
        }
        const updatedContact = new Contact(contactData.email ?? existingContact.email, 'facebook' in contactData ? contactData.facebook : existingContact.facebook, 'twitter' in contactData ? contactData.twitter : existingContact.twitter, 'instagram' in contactData ? contactData.instagram : existingContact.instagram);
        updatedContact.id = existingContact.id;
        return this.contactRepository.updateContact(updatedContact);
    }
    async createContact(contactData) {
        const existingContact = await this.contactRepository.getContact();
        if (existingContact) {
            throw new Error('Contact information already exists');
        }
        const contact = new Contact(contactData.email, contactData.facebook, contactData.twitter, contactData.instagram);
        return this.contactRepository.createContact(contact);
    }
};
ContactService = __decorate([
    injectable(),
    __param(0, inject(TYPES.IContactRepository)),
    __metadata("design:paramtypes", [Object])
], ContactService);
export { ContactService };
