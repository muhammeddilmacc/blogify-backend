import type { Request, Response, NextFunction } from 'express';
import { admin } from '../utils/config';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(decodedToken);

    if (!decodedToken) {
      return res.status(401).send('Unauthorized');
    }

    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

export default authenticate;
