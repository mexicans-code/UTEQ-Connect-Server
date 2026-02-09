import * as express from 'express';
import { 
  getUsers, 
  getUserById,
  getUserByEmail,
  createUser, 
  updateUser, 
  deleteUser,
  updateUltimoLogin,
  changeStatus,
  getUsersByRol,
  getActiveUsers
} from './user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/active', getActiveUsers);
router.get('/rol/:rol', getUsersByRol);
router.get('/email/:email', getUserByEmail);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/ultimo-login', updateUltimoLogin);
router.patch('/:id/status', changeStatus);

export default router;