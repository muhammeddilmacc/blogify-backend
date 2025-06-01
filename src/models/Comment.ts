import { FieldValue } from 'firebase-admin/firestore';
import { IModel } from '../abstracts/interfaces/models/IModel';
import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class Comment implements IModel {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  uid!: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsDate()
  @IsOptional()
  createdAt!: Date | FieldValue;

  @IsDate()
  @IsOptional()
  updatedAt!: Date | FieldValue;

  constructor(
    content: string,
    postId: string,
    userId: string,
    userEmail: string
  ) {
    this.content = content;
    this.postId = postId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.uid = userId;
  }
} 