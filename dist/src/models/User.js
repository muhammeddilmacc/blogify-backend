var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsArray, IsEmail } from 'class-validator';
import { Model } from './Model.js';
export class User extends Model {
    constructor(uid, name, email, role, lastLoginAt) {
        super(uid);
        this.name = name;
        this.email = email;
        this.role = role;
        this.lastLoginAt = lastLoginAt;
    }
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    IsArray(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    IsString(),
    __metadata("design:type", Function)
], User.prototype, "lastLoginAt", void 0);
