import { inject, injectable } from 'inversify';
import type { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';

@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(UserService) private userService: UserService,
  ) {}

  async registerUser(req: Request, res: Response) {
    const { uid, token, userData } = req.body;

    try {
      const result = await this.authService.registerUser({ uid, userData });

      res.setHeader('Set-Cookie', `token=${token}; HttpOnly`).status(200).json({
        message: 'User registered successfully',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    const { uid } = req.body;

    const users = await this.userService.getUserByUid(uid as string);
    res.status(200).json(users);
  }

  async loginUser(req: Request, res: Response) {
    const { id, token } = req.body;

    try {
      console.log('Login isteği alındı:', { id });
      const user = await this.authService.loginUser({ id, token });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        domain: process.env.NODE_ENV === 'production' ? 'google.com' : 'localhost'
      };

      console.log('Cookie ayarları:', cookieOptions);

      // Token cookie'sini ayarla
      res.cookie('token', token, cookieOptions);
      
      // Session cookie'sini ayarla
      res.cookie('session', 'true', cookieOptions);

      // CORS headers'ı güçlendir
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Expose-Headers', 'Set-Cookie');

      console.log('Cookies set successfully');

      res.status(200).json({
        user,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error });
    }
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    try {
      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/',
        expires: new Date(0)
      };

      // Tüm cookie'leri temizle
      const cookiesToClear = ['token', 'session', 'firebase-token'];
      cookiesToClear.forEach(cookieName => {
        res.clearCookie(cookieName, cookieOptions);
      });

      // Header'ları temizle
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');

      res.status(200).json({ 
        message: 'User logged out successfully',
        clearedCookies: cookiesToClear 
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Logout failed', 
        details: error?.message || 'Unknown error' 
      });
    }
  }

  async getUserRole(req: Request, res: Response): Promise<void> {
    const { uid, token } = req.body;
    try {
      const user = await this.userService.getUserRole(token);
      res.status(200).json({ user: user });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    try {
      const userRecord = await this.userService.getUserByEmail(email);

      if (!userRecord) {
        throw Error('No user with this email exists');
      }
      await this.authService.forgotPassword(email);
      res.status(200).send('Password reset email sent');
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { uid, password } = req.body;
    try {
      await this.authService.changePassword({ uid, password });
      res.status(200).send('Password changed');
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    try {
      await this.authService.verifyEmail(email);
      res.status(200).send('Email verification sent');
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
}
