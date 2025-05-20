import { injectable, unmanaged } from 'inversify';
import type { IModel } from './interfaces/models/IModel';
import type { IBaseService } from './interfaces/services/IBaseService';
import type { IBaseRepository } from './interfaces/repositories/IBaseRepository';

@injectable()
export abstract class BaseService<T extends IModel> implements IBaseService<T> {
  constructor(@unmanaged() protected repository: IBaseRepository<T>) {}

  async create(item: T): Promise<void> {
    await this.repository.create(item);
  }

  async update(item: T): Promise<void> {
    await this.repository.update(item);
  }

  async delete(item: T): Promise<void> {
    await this.repository.delete(item);
  }

  async findAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  async findByUid(uid: string): Promise<T | null> {
    return await this.repository.findByUid(uid);
  }
}
