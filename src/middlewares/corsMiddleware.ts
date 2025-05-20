import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const allowedOrigins = [
    'https://alicendek.vercel.app',
    'https://alicendek.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Methods'
  );

  // Preflight isteğine yanıt ver
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};
