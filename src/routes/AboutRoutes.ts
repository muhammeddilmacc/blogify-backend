import { Router } from 'express';
import { container } from '../inversify.config';
import { AboutController } from '../controllers/AboutController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();
const aboutController = container.get(AboutController);

router.get('/', (req, res) => aboutController.getAbout(req, res));
router.put('/', upload.single('image'), (req, res) => aboutController.updateAbout(req, res));

export default router; 