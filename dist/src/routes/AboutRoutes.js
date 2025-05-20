import { Router } from 'express';
import { container } from '../inversify.config.js';
import { AboutController } from '../controllers/AboutController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
const router = Router();
const aboutController = container.get(AboutController);
router.get('/', (req, res) => aboutController.getAbout(req, res));
router.put('/', upload.single('image'), (req, res) => aboutController.updateAbout(req, res));
export default router;
