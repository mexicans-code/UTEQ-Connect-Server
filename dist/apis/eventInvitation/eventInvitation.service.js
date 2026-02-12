import EventInvitation from './eventInvitation.model.js';
import User from '../user/user.model.js';
import Event from '../event/event.model.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
// Generar token único
const generateUniqueToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
// Generar código QR
const generateQRCode = async (token) => {
    try {
        // Genera el QR en formato base64
        const qrCodeDataURL = await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1
        });
        return qrCodeDataURL;
    }
    catch (error) {
        throw new Error('Error generando código QR');
    }
};
// Crear invitaciones masivas para un evento
export const createInvitationsForEvent = async (eventoId, userIds) => {
    try {
        const event = await Event.findById(eventoId);
        if (!event) {
            throw new Error('Evento no encontrado');
        }
        // Si no se especifican usuarios, invitar a todos los activos
        let users;
        if (userIds && userIds.length > 0) {
            users = await User.find({
                _id: { $in: userIds },
                estatus: "activo"
            });
        }
        else {
            users = await User.find({
                estatus: "activo",
                rol: "user" // Solo invitar a usuarios regulares
            });
        }
        const invitations = [];
        const existingInvitations = [];
        for (const user of users) {
            // Verificar si ya existe invitación
            const existingInvitation = await EventInvitation.findOne({
                evento: eventoId,
                usuario: user._id
            });
            if (!existingInvitation) {
                const token = generateUniqueToken();
                const qrCode = await generateQRCode(token);
                const invitation = new EventInvitation({
                    evento: eventoId,
                    usuario: user._id,
                    token: token,
                    qrCode: qrCode
                });
                await invitation.save();
                invitations.push(invitation);
            }
            else {
                existingInvitations.push(user.email);
            }
        }
        return {
            created: invitations,
            alreadyInvited: existingInvitations,
            total: users.length
        };
    }
    catch (error) {
        throw error;
    }
};
// Obtener invitación por token
export const findInvitationByToken = async (token) => {
    try {
        const invitation = await EventInvitation.findOne({ token })
            .populate('evento')
            .populate('usuario', '-passwordHash');
        return invitation;
    }
    catch (error) {
        throw new Error('Error obteniendo invitación');
    }
};
// Validar y usar token (marcar asistencia)
export const validateAndUseToken = async (token) => {
    try {
        const invitation = await EventInvitation.findOne({ token })
            .populate('evento')
            .populate('usuario', '-passwordHash');
        if (!invitation) {
            throw new Error('Token inválido');
        }
        if (invitation.estadoAsistencia === 'asistio') {
            throw new Error('Token ya fue utilizado');
        }
        if (invitation.estadoInvitacion === 'caducada') {
            throw new Error('La invitación ha caducado');
        }
        if (invitation.estadoInvitacion === 'rechazada') {
            throw new Error('Has rechazado esta invitación');
        }
        // Verificar si el evento ya pasó
        const event = invitation.evento;
        const eventDate = new Date(event.fechaFin);
        const now = new Date();
        if (eventDate < now) {
            invitation.estadoInvitacion = 'caducada';
            await invitation.save();
            throw new Error('El evento ya finalizó');
        }
        // Marcar como asistido
        invitation.estadoAsistencia = 'asistio';
        invitation.fechaUsoToken = new Date();
        invitation.intentosUso += 1;
        await invitation.save();
        return invitation;
    }
    catch (error) {
        throw error;
    }
};
// Obtener todas las invitaciones de un evento
export const findInvitationsByEvent = async (eventoId) => {
    try {
        const invitations = await EventInvitation.find({ evento: eventoId })
            .populate('usuario', '-passwordHash')
            .sort({ fechaEnvio: -1 });
        return invitations;
    }
    catch (error) {
        throw new Error('Error obteniendo invitaciones del evento');
    }
};
// Obtener estadísticas de invitaciones de un evento
export const getEventInvitationStats = async (eventoId) => {
    try {
        const total = await EventInvitation.countDocuments({ evento: eventoId });
        const enviadas = await EventInvitation.countDocuments({ evento: eventoId, emailEnviado: true });
        const aceptadas = await EventInvitation.countDocuments({ evento: eventoId, estadoInvitacion: "aceptada" });
        const rechazadas = await EventInvitation.countDocuments({ evento: eventoId, estadoInvitacion: "rechazada" });
        const asistieron = await EventInvitation.countDocuments({ evento: eventoId, estadoAsistencia: "asistio" });
        const noAsistieron = await EventInvitation.countDocuments({ evento: eventoId, estadoAsistencia: "no_asistio" });
        return {
            total,
            enviadas,
            aceptadas,
            rechazadas,
            asistieron,
            noAsistieron,
            pendientes: total - asistieron - noAsistieron
        };
    }
    catch (error) {
        throw new Error('Error obteniendo estadísticas');
    }
};
// Obtener todas las invitaciones de un usuario
export const findInvitationsByUser = async (userId) => {
    try {
        const invitations = await EventInvitation.find({ usuario: userId })
            .populate('evento')
            .sort({ fechaEnvio: -1 });
        return invitations;
    }
    catch (error) {
        throw new Error('Error obteniendo invitaciones del usuario');
    }
};
// Actualizar estado de invitación
export const updateInvitationStatus = async (invitationId, estadoInvitacion) => {
    try {
        const invitation = await EventInvitation.findByIdAndUpdate(invitationId, {
            estadoInvitacion,
            fechaRespuesta: new Date()
        }, { new: true })
            .populate('evento')
            .populate('usuario', '-passwordHash');
        return invitation;
    }
    catch (error) {
        throw new Error('Error actualizando estado de invitación');
    }
};
// Responder a invitación por token
export const respondToInvitationByToken = async (token, respuesta) => {
    try {
        const invitation = await EventInvitation.findOne({ token });
        if (!invitation) {
            throw new Error('Invitación no encontrada');
        }
        invitation.estadoInvitacion = respuesta;
        invitation.fechaRespuesta = new Date();
        await invitation.save();
        return await invitation.populate(['evento', { path: 'usuario', select: '-passwordHash' }]);
    }
    catch (error) {
        throw error;
    }
};
// Marcar email como enviado
export const markEmailAsSent = async (invitationId) => {
    try {
        const invitation = await EventInvitation.findByIdAndUpdate(invitationId, { emailEnviado: true }, { new: true });
        return invitation;
    }
    catch (error) {
        throw new Error('Error marcando email como enviado');
    }
};
// Eliminar invitaciones de un evento
export const deleteInvitationsByEvent = async (eventoId) => {
    try {
        const result = await EventInvitation.deleteMany({ evento: eventoId });
        return result;
    }
    catch (error) {
        throw new Error('Error eliminando invitaciones');
    }
};
// Marcar asistencia manualmente (sin usar token)
export const markAttendance = async (invitationId, asistio) => {
    try {
        const estadoAsistencia = asistio ? "asistio" : "no_asistio";
        const invitation = await EventInvitation.findByIdAndUpdate(invitationId, {
            estadoAsistencia,
            fechaUsoToken: asistio ? new Date() : undefined
        }, { new: true })
            .populate('evento')
            .populate('usuario', '-passwordHash');
        return invitation;
    }
    catch (error) {
        throw new Error('Error actualizando asistencia');
    }
};
// Regenerar QR para una invitación
export const regenerateQRCode = async (invitationId) => {
    try {
        const invitation = await EventInvitation.findById(invitationId);
        if (!invitation) {
            throw new Error('Invitación no encontrada');
        }
        const qrCode = await generateQRCode(invitation.token);
        invitation.qrCode = qrCode;
        await invitation.save();
        return invitation;
    }
    catch (error) {
        throw error;
    }
};
