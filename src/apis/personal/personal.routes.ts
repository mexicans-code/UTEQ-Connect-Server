import * as express from 'express';
import { 
  getPersonal, 
  getPersonalById,
  getPersonalByNumeroEmpleado,
  getPersonalByEmail,
  getPersonalByUserId,
  createPersonal, 
  updatePersonal, 
  deletePersonal,
  updateEstatus,
  getPersonalByCargo,
  getPersonalByEdificio,
  getPersonalDentro,
  getPersonalFuera,
  searchPersonal
} from './personal.controller.js';

const router = express.Router();

router.get('/', getPersonal);
router.get('/dentro', getPersonalDentro);
router.get('/fuera', getPersonalFuera);
router.get('/search/:term', searchPersonal);
router.get('/cargo/:cargo', getPersonalByCargo);
router.get('/edificio/:edificioId', getPersonalByEdificio);
router.get('/numero/:numeroEmpleado', getPersonalByNumeroEmpleado);
router.get('/email/:email', getPersonalByEmail);
router.get('/user/:userId', getPersonalByUserId);
router.get('/:id', getPersonalById);
router.post('/', createPersonal);
router.put('/:id', updatePersonal);
router.delete('/:id', deletePersonal);
router.patch('/:id/estatus', updateEstatus);

export default router;