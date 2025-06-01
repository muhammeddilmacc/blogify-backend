import { Router } from 'express';
import { container } from '../inversify.config';
import { CommentService } from '../services/CommentService';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
const commentService = container.get(CommentService);

// Yorum oluşturma
router.post('/create', catchAsync(async (req, res) => {
  const { content, postId, userId, userEmail } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('Token bulunamadı');
  }

  const comment = await commentService.createComment({
    content,
    postId,
    userId,
    userEmail,
    token
  });
  res.status(201).json(comment);
}));

// Post ID'ye göre yorumları getirme
router.get('/post/:postId', catchAsync(async (req, res) => {
  const { postId } = req.params;
  const comments = await commentService.getCommentsByPostId(postId);
  res.json(comments);
}));

// Kullanıcı ID'ye göre yorumları getirme
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  const comments = await commentService.getCommentsByUserId(userId);
  res.json(comments);
}));

// Yorum silme
router.delete('/:commentId', catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('Token bulunamadı');
  }

  await commentService.deleteComment(commentId, userId, token);
  res.status(204).send();
}));

// Yorum güncelleme
router.put('/:commentId', catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('Token bulunamadı');
  }

  const updatedComment = await commentService.updateComment({
    commentId,
    userId,
    content,
    token
  });
  res.json(updatedComment);
}));

export default router; 