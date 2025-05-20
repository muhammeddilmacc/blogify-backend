import express from 'express';
import { container } from '../inversify.config.js';
import { UserController } from '../controllers/UserController.js';
const userController = container.get(UserController);
const router = express.Router();
// get all users
router.get('/', (req, res) => userController.getUser(req, res));
router.get('/:uid', (req, res) => userController.getUser(req, res));
router.post('/create-user', (req, res) => userController.createUser(req, res));
router.post('/get-role', (req, res) => userController.getUserRole(req, res));
export default router;
