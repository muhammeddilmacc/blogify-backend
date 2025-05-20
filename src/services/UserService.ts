import { User } from '@/models/User';
import { AppError } from '@/middlewares/ErrorHandler';
import { UserRepository } from '@/repositories/UserRepository';
import { inject, injectable } from 'inversify';

@injectable()
export class UserService {
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  async getUserByUid(uid: string): Promise<User | null> {
    return this.userRepository.findByUid(uid);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }

  async createUser(user: User): Promise<void> {
    const existingUser = await this.userRepository.findByUid(user.uid);

    console.log('Creating user: ', existingUser);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    await this.userRepository.create(user);
  }

  async updateUser(user: User): Promise<void> {
    await this.userRepository.update(user);
  }

  async getUserRole(uid: string): Promise<User | null> {
    return this.userRepository.getUserrole(uid);
  }
}
