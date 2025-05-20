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
import { UserService } from '../services/UserService.js';
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
        this.userService = userService;
    }
    async createUser(req, res) {
        const user = req.body;
        await this.userService.createUser(user);
        res.status(201).send('User created');
    }
    async getUser(req, res) {
        const { uid } = req.query;
        const users = await this.userService.getUserByUid(uid);
        res.status(200).json(users);
    }
    async updateUser(req, res) {
        const user = req.body;
        await this.userService.updateUser(user);
        res.status(200).send('User updated');
    }
    async getUserRole(req, res) {
        const { uid } = req.body;
        const user = await this.userService.getUserRole(uid);
        res.status(200).json(user);
    }
};
UserController = __decorate([
    injectable(),
    __param(0, inject(UserService)),
    __metadata("design:paramtypes", [UserService])
], UserController);
export { UserController };
