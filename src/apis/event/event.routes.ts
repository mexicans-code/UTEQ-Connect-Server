import * as express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deactivateEvent,
  updateCupos,
  getActiveEvents,
  getEventsByDestino,
  uploadEventImage,
  deleteEventImage, reasignarYCrear, reasignarYActualizar
} from './event.controller.js';
import { upload } from '../../config/multer.config.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/active', getActiveEvents);
router.get('/destino/:destinoId', getEventsByDestino);
router.get('/:id', getEventById);
router.post('/reasignar-crear',   reasignarYCrear);

router.post('/', authenticateToken, upload.single('image'), createEvent);
router.put('/:id', upload.single('image'), updateEvent);
router.put('/:id/reasignar-actualizar', reasignarYActualizar);

router.delete('/:id', deleteEvent);
router.patch('/:id/deactivate', deactivateEvent);
router.patch('/:id/cupos', updateCupos);
router.post('/:id/image', upload.single('image'), uploadEventImage);
router.delete('/:id/image', deleteEventImage);

export default router;