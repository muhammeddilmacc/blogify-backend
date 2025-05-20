import { IModel } from '../models/IModel';

export interface IBaseService<T extends IModel> {
  create: (item: T) => Promise<void>;
  update: (item: T) => Promise<void>;
  delete: (item: T) => Promise<void>;
  findAll: () => Promise<T[]>;
  findByUid: (uid: string) => Promise<T | null>;
}
