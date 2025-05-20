import { Router } from 'express';
import { container } from '../inversify.config.js';
import { ContactController } from '../controllers/ContactController.js';
const router = Router();
const contactController = container.get(ContactController);
// İletişim bilgileri işlemleri
router.get('/', (req, res) => contactController.getContact(req, res));
router.put('/', (req, res) => contactController.updateContact(req, res));
router.post('/', (req, res) => contactController.createContact(req, res));
export default router;
