import { FieldValue } from 'firebase-admin/firestore';

export interface IModel {
  id: string;
  uid: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
}
