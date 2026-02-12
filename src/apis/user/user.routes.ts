import express from 'express';
import {
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deactivateUser,
  activateUser,
  deleteUser
} from './user.controller.js';
import { 
  authenticateToken, 
  requireAdmin,
  requireRole 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// ========== RUTAS PROTEGIDAS (Usuario autenticado) ==========
router.get('/profile', authenticateToken, getProfile);                    // GET /users/profile
router.put('/change-password', authenticateToken, changePassword);        // PUT /users/change-password

// ========== RUTAS DE ADMINISTRACIÓN (Solo admin/superadmin) ==========
router.get('/', authenticateToken, requireAdmin, getAllUsers);            // GET /users
router.get('/:id', authenticateToken, requireAdmin, getUserById);         // GET /users/:id
router.put('/:id', authenticateToken, requireAdmin, updateUser);          // PUT /users/:id
router.patch('/:id/deactivate', authenticateToken, requireAdmin, deactivateUser); // PATCH /users/:id/deactivate
router.patch('/:id/activate', authenticateToken, requireAdmin, activateUser);     // PATCH /users/:id/activate

// ========== SOLO SUPERADMIN ==========
router.delete('/:id', authenticateToken, requireRole('superadmin'), deleteUser);  // DELETE /users/:id

export default router;