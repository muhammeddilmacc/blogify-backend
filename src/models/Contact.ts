import { IsString, IsNotEmpty, IsEmail, IsUrl, IsOptional } from 'class-validator';
import type { FieldValue } from 'firebase-admin/firestore';

export class Contact {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  instagram?: string;

  createdAt!: FieldValue;
  updatedAt!: FieldValue;

  constructor(
    email: string,
    facebook?: string,
    twitter?: string,
    instagram?: string,
  ) {
    this.email = email;
    this.facebook = facebook;
    this.twitter = twitter;
    this.instagram = instagram;
  }
} 