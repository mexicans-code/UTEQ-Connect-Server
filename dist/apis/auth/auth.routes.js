import express from 'express';
import { register, registerAdmin, login } from './auth.controller.js';
const router = express.Router();
// Rutas públicas de autenticación
router.post('/register', register); // POST /auth/register
router.post('/register-admin', registerAdmin); // POST /auth/register-admin → rol: admin o superadmin
router.post('/login', login); // POST /auth/login
export default router;
