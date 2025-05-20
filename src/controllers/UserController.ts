// controllers/UserController.ts
import type { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { UserService } from '@/services/UserService';

@injectable()
export class UserController {
  constructor(@inject(UserService) protected userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const user = req.body;
    await this.userService.createUser(user);
    res.status(201).send('User created');
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const { uid } = req.query;

    const users = await this.userService.getUserByUid(uid as string);
    res.status(200).json(users);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const user = req.body;
    await this.userService.updateUser(user);
    res.status(200).send('User updated');
  }

  async getUserRole(req: Request, res: Response): Promise<void> {
    const { uid } = req.body;
    const user = await this.userService.getUserRole(uid);
    res.status(200).json(user);
  }
}
