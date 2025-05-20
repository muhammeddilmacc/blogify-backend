import { Router } from 'express';
import { container } from '../inversify.config.js';
import { PostController } from '../controllers/PostController.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
const router = Router();
const postController = container.get(PostController);
// Resim yükleme endpoint'i
router.post('/upload', uploadMiddleware.single(), (req, res) => postController.uploadImage(req, res));
// Post işlemleri
router.post('/create', (req, res) => postController.createPost(req, res));
router.get('/', (req, res) => postController.getPosts(req, res));
router.get('/id/:id', (req, res) => postController.getPostById(req, res));
router.get('/:slug', (req, res) => postController.getPostBySlug(req, res));
router.put('/:id', (req, res) => postController.updatePost(req, res));
router.delete('/:id', (req, res) => postController.deletePost(req, res));
export default router;
