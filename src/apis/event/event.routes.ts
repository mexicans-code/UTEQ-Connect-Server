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
  getEventsByDestino
} from './event.controller.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/active', getActiveEvents);
router.get('/destino/:destinoId', getEventsByDestino);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/deactivate', deactivateEvent);
router.patch('/:id/cupos', updateCupos);

export default router;