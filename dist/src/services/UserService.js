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
import { AppError } from '../middlewares/ErrorHandler.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { inject, injectable } from 'inversify';
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getUserByUid(uid) {
        return this.userRepository.findByUid(uid);
    }
    async getUserByEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        return user;
    }
    async createUser(user) {
        const existingUser = await this.userRepository.findByUid(user.uid);
        console.log('Creating user: ', existingUser);
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }
        await this.userRepository.create(user);
    }
    async updateUser(user) {
        await this.userRepository.update(user);
    }
    async getUserRole(uid) {
        return this.userRepository.getUserrole(uid);
    }
};
UserService = __decorate([
    injectable(),
    __param(0, inject(UserRepository)),
    __metadata("design:paramtypes", [UserRepository])
], UserService);
export { UserService };
