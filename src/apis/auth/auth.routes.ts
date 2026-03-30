import express from 'express';
import { register, registerAdmin, login, biometricLogin, getMe } from './auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/register', register);  // POST /auth/register
router.post('/register-admin', registerAdmin);   // POST /auth/register-admin → rol: admin o superadmin
router.post('/login', login);        // POST /auth/login
router.post('/biometric-login', biometricLogin); // POST /auth/biometric-login


router.get('/me', authenticateToken, getMe);


export default router;

