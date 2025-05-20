import type { IModel } from '../models/IModel';

export interface IBaseRepository<T extends IModel> {
  create: (item: T) => Promise<void>;
  update: (item: T) => Promise<void>;
  delete: (item: T) => Promise<void>;
  findAll: () => Promise<T[]>;
  findByUid: (uid: string) => Promise<T | null>;
}
