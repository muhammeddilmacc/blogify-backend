import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import * as dotenv from 'dotenv';
import 'reflect-metadata';

import authRoutes from './routes/AuthRoutes';
import userRoutes from './routes/UserRoutes';
import postRoutes from './routes/PostRoutes';
import aboutRoutes from './routes/AboutRoutes';
import contactRoutes from './routes/ContactRoutes';
import commentRoutes from './routes/CommentRoutes';

import { errorHandler } from './middlewares/ErrorHandler';
import { corsMiddleware } from './middlewares/corsMiddleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cookieParser());

// CORS ayarları
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    
    const allowedOrigins = [
      // productions url backend and frontend
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    // origin undefined olabilir (örn: Postman istekleri)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS ihlali, izin verilmeyen origin:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin'],
  maxAge: 86400,
  preflightContinue: true
};

app.use(cors(corsOptions));
app.use(corsMiddleware);

// Set additional headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  next();
});

app.use(express.json());

// Statik dosyalar için uploads klasörünü ayarla
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Ping endpoint - Keep-alive system
app.get('/ping', (req, res) => {
  res.status(200).send('Ping OK');
});

// Ping in every 5 minutes
setInterval(async () => {
  try {
    //console.log('Ping gönderiliyor...');
    //await fetch('backend ping url'); 
  } catch (error) {
    console.error('Ping gönderilemedi:', error);
  }
}, 1000 * 60 * 5); // 5 dakikada bir (300,000 ms)

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the blog Processing API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/comments', commentRoutes);

app.use(errorHandler);

export default app;
