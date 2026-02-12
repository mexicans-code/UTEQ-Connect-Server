import * as invitationService from './eventInvitation.service.js';
export const createInvitations = async (req, res) => {
    try {
        const eventoId = Array.isArray(req.params.eventoId) ? req.params.eventoId[0] : req.params.eventoId;
        const { userIds } = req.body; // Array opcional de IDs de usuarios
        const result = await invitationService.createInvitationsForEvent(eventoId, userIds);
        res.status(201).json({
            success: true,
            message: `${result.created.length} invitaciones creadas exitosamente`,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const getInvitationByToken = async (req, res) => {
    try {
        const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
        const invitation = await invitationService.findInvitationByToken(token);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'Invitación no encontrada'
            });
        }
        res.json({
            success: true,
            data: invitation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const validateToken = async (req, res) => {
    try {
        const { token } = req.body;
        const invitation = await invitationService.validateAndUseToken(token);
        res.json({
            success: true,
            message: 'Asistencia registrada exitosamente',
            data: invitation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const getEventInvitations = async (req, res) => {
    try {
        const eventoId = Array.isArray(req.params.eventoId) ? req.params.eventoId[0] : req.params.eventoId;
        const invitations = await invitationService.findInvitationsByEvent(eventoId);
        res.json({
            success: true,
            data: invitations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const getEventStats = async (req, res) => {
    try {
        const eventoId = Array.isArray(req.params.eventoId) ? req.params.eventoId[0] : req.params.eventoId;
        const stats = await invitationService.getEventInvitationStats(eventoId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const getUserInvitations = async (req, res) => {
    try {
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const invitations = await invitationService.findInvitationsByUser(userId);
        res.json({
            success: true,
            data: invitations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const updateInvitationStatus = async (req, res) => {
    try {
        const invitationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { estadoInvitacion } = req.body;
        const invitation = await invitationService.updateInvitationStatus(invitationId, estadoInvitacion);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'Invitación no encontrada'
            });
        }
        res.json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: invitation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const respondToInvitation = async (req, res) => {
    try {
        const { token, respuesta } = req.body;
        if (!respuesta || (respuesta !== "aceptada" && respuesta !== "rechazada")) {
            return res.status(400).json({
                success: false,
                error: 'Respuesta inválida. Debe ser "aceptada" o "rechazada"'
            });
        }
        const invitation = await invitationService.respondToInvitationByToken(token, respuesta);
        res.json({
            success: true,
            message: `Invitación ${respuesta} exitosamente`,
            data: invitation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const markAttendance = async (req, res) => {
    try {
        const invitationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { asistio } = req.body;
        if (typeof asistio !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'El campo "asistio" debe ser un booleano'
            });
        }
        const invitation = await invitationService.markAttendance(invitationId, asistio);
        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'Invitación no encontrada'
            });
        }
        res.json({
            success: true,
            message: 'Asistencia actualizada exitosamente',
            data: invitation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const regenerateQR = async (req, res) => {
    try {
        const invitationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const invitation = await invitationService.regenerateQRCode(invitationId);
        res.json({
            success: true,
            message: 'Código QR regenerado exitosamente',
            data: invitation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
