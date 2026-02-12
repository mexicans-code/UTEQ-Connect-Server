import express from 'express';
import { register, login } from './auth.controller.js';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/register', register);  // POST /auth/register
router.post('/login', login);        // POST /auth/login

export default router;