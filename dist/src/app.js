import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import postRoutes from './routes/PostRoutes.js';
import aboutRoutes from './routes/AboutRoutes.js';
import { errorHandler } from './middlewares/ErrorHandler.js';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: [
        'https://alicendek.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Methods',
    ],
    exposedHeaders: ['Access-Control-Allow-Origin'],
}));
app.use(corsMiddleware);
app.use(express.json());
// Statik dosyalar için uploads klasörünü ayarla
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the blog Processing API',
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/about', aboutRoutes);
app.use(errorHandler);
export default app;
