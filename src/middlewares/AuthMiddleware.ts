import type { Request, Response, NextFunction } from 'express';
import { admin } from '../utils/config';
import type { FieldValue } from 'firebase-admin/firestore';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: 'Bu işlem için giriş yapmanız gerekiyor' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      res.status(401).json({ error: 'Geçersiz token' });
      return;
    }

    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = {
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || '',
      role: 'user',
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    next();
  } catch (error) {
    console.error('Auth hatası:', error);
    res.status(401).json({ error: 'Oturum süresi dolmuş veya geçersiz' });
  }
};

export default authenticate;
