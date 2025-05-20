import type { IModel } from '@/abstracts/interfaces/models/IModel';
import { IsString, validate } from 'class-validator';
import { FieldValue } from 'firebase-admin/firestore';

export abstract class Model implements IModel {
  @IsString()
  uid: string;

  createdAt: FieldValue;
  updatedAt: FieldValue;

  constructor(uid: string) {
    this.uid = uid;
    this.createdAt = FieldValue.serverTimestamp();
    this.updatedAt = FieldValue.serverTimestamp();

  }
}
