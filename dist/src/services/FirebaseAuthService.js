// src/services/FirebaseAuthService.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { admin } from '../utils/config.js';
import { injectable } from 'inversify';
let FirebaseAuthService = class FirebaseAuthService {
    /**
     * Verifies a user with an ID Token
     * @param token - The user's ID token
     * @returns User information or an error
     */
    async verifyIdToken(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await admin.auth().getUser(decodedToken.uid);
            return user;
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }
    /**
     * Registers a new user with email and password
     * @param email - User's email address
     * @param password - User's password
     * @param displayName - Optional display name for the user
     * @returns User information or an error
     */
    async registerUser(email, password, displayName) {
        try {
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName,
            });
            return userRecord;
        }
        catch (error) {
            console.error('User registration failed:', error);
            return null;
        }
    }
    /**
     * Retrieves a user by UID
     * @param uid - The user's UID
     * @returns User information or an error
     */
    async getUserByUid(uid) {
        try {
            const user = await admin.auth().getUser(uid);
            return user;
        }
        catch (error) {
            // console.error(`User retrieval failed for UID ${uid}:`, error);
            return null;
        }
    }
    /**
     * Updates user information
     * @param uid - The user's UID
     * @param data - The data to update
     * @returns Updated user information or an error
     */
    async updateUser(uid, data) {
        try {
            const updateData = {};
            if (data.email)
                updateData.email = data.email;
            if (data.displayName)
                updateData.displayName = data.displayName;
            if (data.photoURL)
                updateData.photoURL = data.photoURL;
            if (data.phoneNumber)
                updateData.phoneNumber = data.phoneNumber;
            const updatedUser = await admin.auth().updateUser(uid, updateData);
            return updatedUser;
        }
        catch (error) {
            console.error(`Failed to update user ${uid}:`, error);
            return null;
        }
    }
    /**
     * Deletes a user
     * @param uid - The user's UID
     * @returns Operation result or an error
     */
    async deleteUser(uid) {
        try {
            await admin.auth().deleteUser(uid);
            return true;
        }
        catch (error) {
            console.error('User deletion failed:', error);
            return false;
        }
    }
    /**
     * Sends a password reset email | used for forgot password
     * @param email - The email address to send the password reset email
     * @returns Operation result or an error
     */
    async sendPasswordResetEmail(email) {
        try {
            const result = await admin.auth().generatePasswordResetLink(email);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    /**
     * updates user password
     * @param uid - The user's UID
     * @param newPassword - The new password
     * @returns Updated user information or an error
     */
    async changePassword(uid, password) {
        try {
            await admin.auth().updateUser(uid, { password });
            return true;
        }
        catch (error) {
            console.error(`Failed to update user password ${uid}:`, error);
            return false;
        }
    }
    /**
     * Sends an email verification link to the user
     * @param email - The email address to send the verification email
     * @returns Operation result or an error
     */
    async sendEmailVerification(email) {
        try {
            await admin.auth().generateEmailVerificationLink(email);
            return true;
        }
        catch (error) {
            console.error('Email verification failed:', error);
            return false;
        }
    }
};
FirebaseAuthService = __decorate([
    injectable()
], FirebaseAuthService);
export { FirebaseAuthService };
