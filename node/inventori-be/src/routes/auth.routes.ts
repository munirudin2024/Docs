import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username harus diisi'),
    body('password').notEmpty().withMessage('Password harus diisi'),
  ],
  authController.login
);

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username harus diisi'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap harus diisi'),
  ],
  authController.register
);

export default router;
