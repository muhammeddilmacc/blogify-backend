import express from 'express';
import authRoutes from './AuthRoutes';
import userRoutes from './UserRoutes';
import postRoutes from './PostRoutes';
import aboutRoutes from './AboutRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/about', aboutRoutes);

export default router; 
