import { FirestoreRepository } from '@/abstracts/FirestoreRepository';
import type { IUserRepository } from '@/abstracts/interfaces/repositories/IUserRepository';
import { User } from '@/models/User';
import { injectable } from 'inversify';

@injectable()
export class UserRepository
  extends FirestoreRepository<User>
  implements IUserRepository
{
  constructor() {
    super('users');
  }
}
