import { Router } from 'express';
import { container } from '@/inversify.config';
import { PostController } from '@/controllers/PostController';
import { uploadMiddleware } from '@/middlewares/uploadMiddleware';

const router = Router();
const postController = container.get<PostController>(PostController);

// Özel route'lar
router.get('/most-visited', (req, res) => postController.getMostVisitedPost(req, res));
router.get('/most-shared', (req, res) => postController.getMostSharedPosts(req, res));
router.get('/published', postController.getPublishedPosts.bind(postController));

// Resim yükleme endpoint'i
router.post('/upload', uploadMiddleware.single(), (req, res) => postController.uploadImage(req, res));

// CRUD işlemleri
router.post('/create', (req, res) => postController.createPost(req, res));
router.get('/', (req, res) => postController.getPosts(req, res));

// Slug route'u ID route'larından önce
router.get('/:slug', (req, res) => postController.getPostBySlug(req, res));

// ID tabanlı route'lar
router.get('/id/:id', (req, res) => postController.getPostById(req, res));
router.post('/:id/share', (req, res) => postController.incrementShareCount(req, res));
router.post('/:id/view', (req, res) => postController.incrementViewCount(req, res));
router.put('/:id', (req, res) => postController.updatePost(req, res));
router.delete('/:id', (req, res) => postController.deletePost(req, res));

export default router;
