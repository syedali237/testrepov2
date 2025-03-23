import express from 'express';
const router = express.Router();
import { register, login, logout, refreshToken } from '../controllers/authController.js';

router.post('/register', register);
router.post('/login', login);
router.post('/refreshToken', refreshToken);
router.get('/logout', logout);

export default router;