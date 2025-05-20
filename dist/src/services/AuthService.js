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
import { UserService } from './UserService.js';
import { FieldValue } from 'firebase-admin/firestore';
import { inject, injectable } from 'inversify';
import { FirebaseAuthService } from './FirebaseAuthService.js';
let AuthService = class AuthService {
    constructor(userService, firebaseAuthService) {
        this.userService = userService;
        this.firebaseAuthService = firebaseAuthService;
    }
    async registerUser({ uid, userData, }) {
        const userRecord = await this.firebaseAuthService.getUserByUid(uid);
        if (!userRecord) {
            console.log('User with this id is not available in Auth');
            return null;
        }
        const user = await this.userService.createUser({
            uid: uid,
            email: userRecord.email,
            name: userData.name,
            role: 'user',
            lastLoginAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        return user;
    }
    async loginUser({ id, token }) {
        try {
            const user = await this.firebaseAuthService.verifyIdToken(token);
            if (!user) {
                throw new Error('Token verification failed');
            }
            // Token doğrulama başarılı, kullanıcıyı döndür
            return user;
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    async getUserRole({ token }) {
        try {
            const user = await this.firebaseAuthService.verifyIdToken(token);
            if (!user) {
                throw new Error('Token verification failed');
            }
            return user;
        }
        catch (error) {
            console.error('Error getting user role:', error);
            throw error;
        }
    }
    async forgotPassword({ email }) {
        try {
            const result = await this.firebaseAuthService.sendPasswordResetEmail(email);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async changePassword({ uid, password }) {
        try {
            const result = await this.firebaseAuthService.changePassword(uid, password);
            if (!result) {
                throw new Error('Password change failed');
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async verifyEmail({ email }) {
        try {
            const result = await this.firebaseAuthService.sendEmailVerification(email);
            if (!result) {
                throw new Error('Email verification failed');
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
};
AuthService = __decorate([
    injectable(),
    __param(0, inject(UserService)),
    __param(1, inject(FirebaseAuthService)),
    __metadata("design:paramtypes", [UserService,
        FirebaseAuthService])
], AuthService);
export { AuthService };
