import { IsString, IsArray, IsEmail } from 'class-validator';
import { Model } from './Model';
import type { FieldValue } from 'firebase-admin/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLoginAt: FieldValue;
  uid: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export class User extends Model {
  // only: name email
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsArray()
  role: string;

  @IsString()
  lastLoginAt: FieldValue;

  constructor(
    uid: string,
    name: string,
    email: string,
    role: string,
    lastLoginAt: FirebaseFirestore.FieldValue,
  ) {
    super(uid);
    this.name = name;
    this.email = email;
    this.role = role;
    this.lastLoginAt = lastLoginAt;
  }
}
