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
import { AuthService } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async registerUser(req, res) {
        const { uid, token, userData } = req.body;
        try {
            const result = await this.authService.registerUser({ uid, userData });
            res.setHeader('Set-Cookie', `token=${token}; HttpOnly`).status(200).json({
                message: 'User registered successfully',
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: error });
        }
    }
    async me(req, res) {
        const { uid } = req.body;
        const users = await this.userService.getUserByUid(uid);
        res.status(200).json(users);
    }
    async loginUser(req, res) {
        const { id, token } = req.body;
        try {
            const user = await this.authService.loginUser({ id, token });
            res
                .cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'none',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost'
            })
                .status(200)
                .json({
                user,
                token
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error });
        }
    }
    async logoutUser(req, res) {
        try {
            res.cookie('token', '', {
                httpOnly: true,
                secure: false,
                sameSite: 'none',
                path: '/',
                expires: new Date(0),
                domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : 'localhost'
            });
            res.status(200).json({ message: 'User logged out successfully' });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    async getUserRole(req, res) {
        const { uid, token } = req.body;
        console.log('uid: ', uid);
        try {
            const user = await this.userService.getUserRole(token);
            console.log('user: ', user);
            console.log('user.email: ', user?.email);
            res.status(200).json({ user: user });
        }
        catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const userRecord = await this.userService.getUserByEmail(email);
            if (!userRecord) {
                throw Error('No user with this email exists');
            }
            await this.authService.forgotPassword(email);
            res.status(200).send('Password reset email sent');
        }
        catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async changePassword(req, res) {
        const { uid, password } = req.body;
        try {
            await this.authService.changePassword({ uid, password });
            res.status(200).send('Password changed');
        }
        catch (error) {
            res.status(500).json({ error: error });
        }
    }
    async verifyEmail(req, res) {
        const { email } = req.body;
        try {
            await this.authService.verifyEmail(email);
            res.status(200).send('Email verification sent');
        }
        catch (error) {
            res.status(500).json({ error: error });
        }
    }
};
AuthController = __decorate([
    injectable(),
    __param(0, inject(AuthService)),
    __param(1, inject(UserService)),
    __metadata("design:paramtypes", [AuthService,
        UserService])
], AuthController);
export { AuthController };
