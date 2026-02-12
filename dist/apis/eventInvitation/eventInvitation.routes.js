import * as express from 'express';
import { createInvitations, getInvitationByToken, validateToken, getEventInvitations, getEventStats, getUserInvitations, updateInvitationStatus, respondToInvitation, markAttendance, regenerateQR } from './eventInvitation.controller.js';
const router = express.Router();
// Crear invitaciones masivas para un evento
router.post('/event/:eventoId/create', createInvitations);
// Obtener invitación por token (para escanear QR)
router.get('/token/:token', getInvitationByToken);
// Validar y usar token (registrar asistencia escaneando QR)
router.post('/validate', validateToken);
// Responder a invitación (aceptar/rechazar)
router.post('/respond', respondToInvitation);
// Obtener todas las invitaciones de un evento
router.get('/event/:eventoId', getEventInvitations);
// Obtener estadísticas de invitaciones de un evento
router.get('/event/:eventoId/stats', getEventStats);
// Obtener todas las invitaciones de un usuario
router.get('/user/:userId', getUserInvitations);
// Actualizar estado de invitación
router.patch('/:id/status', updateInvitationStatus);
// Marcar asistencia manualmente
router.patch('/:id/attendance', markAttendance);
// Regenerar código QR
router.patch('/:id/regenerate-qr', regenerateQR);
export default router;
