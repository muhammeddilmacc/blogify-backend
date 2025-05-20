import { UserService } from './UserService';
import { FieldValue } from 'firebase-admin/firestore';
import { inject, injectable } from 'inversify';
import { FirebaseAuthService } from './FirebaseAuthService';

@injectable()
export class AuthService {
  constructor(
    @inject(UserService) private userService: UserService,
    @inject(FirebaseAuthService)
    private firebaseAuthService: FirebaseAuthService,
  ) {}

  async registerUser({
    uid,
    userData,
  }: {
    uid: string;
    userData: {
      email: string;
      name: string;
      lastLoginAt: FieldValue;
    };
  }) {
    const userRecord = await this.firebaseAuthService.getUserByUid(uid);

    if (!userRecord) {
      console.log('User with this id is not available in Auth');
      return null;
    }

    const user = await this.userService.createUser({
      uid: uid,
      email: userRecord.email as string,
      name: userData.name,
      role: 'user',
      lastLoginAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return user;
  }

  async loginUser({ id, token }: { id: string; token: string }) {
    try {
      const user = await this.firebaseAuthService.verifyIdToken(token);
      if (!user) {
        throw new Error('Token verification failed');
      }

      // Token doğrulama başarılı, kullanıcıyı döndür
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserRole({ token }: { token: string }) {
    try {
      const user = await this.firebaseAuthService.verifyIdToken(token);
      if (!user) {
        throw new Error('Token verification failed');
      }
      return user;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
  }

  async forgotPassword({ email }: { email: string }) {
    try {
      const result = await this.firebaseAuthService.sendPasswordResetEmail(email);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async changePassword({ uid, password }: { uid: string; password: string }) {
    try {
      const result = await this.firebaseAuthService.changePassword(uid, password);
      if (!result) {
        throw new Error('Password change failed');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail({ email }: { email: string }) {
    try {
      const result = await this.firebaseAuthService.sendEmailVerification(email);
      if (!result) {
        throw new Error('Email verification failed');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const user = await this.firebaseAuthService.verifyIdToken(token);
      if (!user) {
        throw new Error('Token verification failed');
      }
      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }
}
