import { Router } from 'express';
import { container } from '@/inversify.config';
import { ContactController } from '@/controllers/ContactController';

const router = Router();
const contactController = container.get<ContactController>(ContactController);

// İletişim bilgileri işlemleri
router.get('/', (req, res) => contactController.getContact(req, res));
router.put('/', (req, res) => contactController.updateContact(req, res));
router.post('/', (req, res) => contactController.createContact(req, res));

export default router; 