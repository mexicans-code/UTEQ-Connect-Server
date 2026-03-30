import EventInvitation from './eventInvitation.model.js';
import Evento from '../event/event.model.js';
import User from '../user/user.model.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
/**
 * Genera un token único para la invitación
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
/**
 * Genera un código QR en base64 a partir de un token
 */
const generateQRCode = async (token) => {
    try {
        const qrCodeData = await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });
        return qrCodeData;
    }
    catch (error) {
        console.error('Error generando QR code:', error);
        throw new Error('No se pudo generar el código QR');
    }
};
/**
 * Crea una invitación individual para un usuario y evento
 * Esta función se usa cuando un usuario se registra al evento
 */
/**
 * Crea una invitación individual para un usuario y evento
 * Esta función se usa cuando un usuario se registra al evento
 */
export const createSingleInvitation = async (eventoId, userId) => {
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    // Verificar si ya existe una invitación para este usuario y evento
    const existingInvitation = await EventInvitation.findOne({
        evento: eventoId,
        usuario: userId,
    });
    if (existingInvitation) {
        // Si ya existe y está aceptada, retornarla
        if (existingInvitation.estadoInvitacion === 'aceptada') {
            return existingInvitation;
        }
        // Si fue rechazada o caducada, lanzar error específico
        if (existingInvitation.estadoInvitacion === 'rechazada') {
            throw new Error('Ya rechazaste la invitación a este evento previamente');
        }
        if (existingInvitation.estadoInvitacion === 'caducada') {
            throw new Error('Tu invitación anterior caducó. Contacta al organizador.');
        }
    }
    // Verificar disponibilidad de cupos
    const evento = await Evento.findById(eventoId);
    if (!evento || !evento.activo) {
        throw new Error('Evento no encontrado o no activo');
    }
    const acceptedCount = await EventInvitation.countDocuments({
        evento: eventoId,
        estadoInvitacion: 'aceptada'
    });
    if (acceptedCount >= evento.cupos) {
        throw new Error('No hay cupos disponibles para este evento');
    }
    try {
        // Generar token único
        const token = generateToken();
        // Generar código QR
        const qrCode = await generateQRCode(token);
        // Crear la invitación
        const invitation = await EventInvitation.create({
            evento: eventoId,
            usuario: userId,
            token,
            qrCode,
            estadoInvitacion: 'aceptada',
            estadoAsistencia: 'pendiente',
            fechaEnvio: new Date(),
            fechaRespuesta: new Date(),
            emailEnviado: false,
        });
        // Recalcular cuposDisponibles basado en invitaciones aceptadas
        const newAcceptedCount = await EventInvitation.countDocuments({
            evento: eventoId,
            estadoInvitacion: 'aceptada'
        });
        const newCuposDisponibles = evento.cupos - newAcceptedCount;
        await Evento.findByIdAndUpdate(eventoId, { cuposDisponibles: newCuposDisponibles });
        return invitation;
    }
    catch (error) {
        throw error;
    }
};
/**
 * Crea invitaciones masivas para un evento
 * @param eventoId - ID del evento
 * @param userIds - Array de IDs de usuarios (opcional, si no se envía, se envía a todos los usuarios activos)
 */
export const createInvitationsForEvent = async (eventoId, userIds) => {
    const evento = await Evento.findById(eventoId);
    if (!evento) {
        throw new Error('Evento no encontrado');
    }
    let users;
    if (userIds && userIds.length > 0) {
        users = await User.find({ _id: { $in: userIds } });
    }
    else {
        users = await User.find({ activo: true });
    }
    const results = {
        created: [],
        existing: [],
        failed: [],
    };
    for (const user of users) {
        try {
            const existingInvitation = await EventInvitation.findOne({
                evento: eventoId,
                usuario: user._id,
            });
            if (existingInvitation) {
                results.existing.push({
                    userId: user._id,
                    email: user.email,
                    invitationId: existingInvitation._id,
                });
                continue;
            }
            const token = generateToken();
            const qrCode = await generateQRCode(token);
            const invitation = await EventInvitation.create({
                evento: eventoId,
                usuario: user._id,
                token,
                qrCode,
                estadoInvitacion: 'enviada',
                estadoAsistencia: 'pendiente',
                fechaEnvio: new Date(),
            });
            results.created.push({
                userId: user._id,
                email: user.email,
                invitationId: invitation._id,
            });
        }
        catch (error) {
            results.failed.push({
                userId: user._id,
                email: user.email,
                error: error instanceof Error ? error.message : 'Error desconocido',
            });
        }
    }
    return results;
};
/**
 * Busca una invitación por su token
 */
export const findInvitationByToken = async (token) => {
    return await EventInvitation.findOne({ token })
        .populate('evento')
        .populate('usuario', 'nombre email imagenPerfil');
};
/**
 * Valida y marca como usado un token (cuando se escanea el QR)
 */
export const validateAndUseToken = async (token) => {
    const invitation = await EventInvitation.findOne({ token }).populate('evento');
    if (!invitation) {
        throw new Error('Token inválido');
    }
    if (invitation.estadoInvitacion !== 'aceptada') {
        throw new Error('La invitación no ha sido aceptada');
    }
    if (invitation.estadoAsistencia === 'asistio') {
        throw new Error('Este token ya fue utilizado');
    }
    // Verificar si el evento ya pasó
    const evento = invitation.evento;
    const eventDate = new Date(evento.fechaInicio);
    const now = new Date();
    if (eventDate < now && now.getTime() - eventDate.getTime() > 24 * 60 * 60 * 1000) {
        throw new Error('El evento ya finalizó');
    }
    // Marcar asistencia
    invitation.estadoAsistencia = 'asistio';
    invitation.fechaUsoToken = new Date();
    invitation.intentosUso += 1;
    await invitation.save();
    return invitation;
};
/**
 * Busca todas las invitaciones de un evento
 */
export const findInvitationsByEvent = async (eventoId) => {
    return await EventInvitation.find({ evento: eventoId })
        .populate('usuario', 'nombre email imagenPerfil')
        .sort({ fechaEnvio: -1 });
};
/**
 * Busca todas las invitaciones de un usuario
 */
export const findInvitationsByUser = async (userId) => {
    return await EventInvitation.find({ usuario: userId })
        .populate('evento')
        .sort({ fechaEnvio: -1 });
};
/**
 * Obtiene estadísticas de invitaciones de un evento
 */
export const getEventInvitationStats = async (eventoId) => {
    const invitations = await EventInvitation.find({ evento: eventoId });
    return {
        total: invitations.length,
        enviadas: invitations.filter((i) => i.estadoInvitacion === 'enviada').length,
        aceptadas: invitations.filter((i) => i.estadoInvitacion === 'aceptada').length,
        rechazadas: invitations.filter((i) => i.estadoInvitacion === 'rechazada').length,
        caducadas: invitations.filter((i) => i.estadoInvitacion === 'caducada').length,
        asistencias: invitations.filter((i) => i.estadoAsistencia === 'asistio').length,
        pendientes: invitations.filter((i) => i.estadoAsistencia === 'pendiente').length,
        noAsistio: invitations.filter((i) => i.estadoAsistencia === 'no_asistio').length,
    };
};
/**
 * Actualiza el estado de una invitación
 */
export const updateInvitationStatus = async (invitationId, estadoInvitacion) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation) {
        return null;
    }
    const previousEstado = invitation.estadoInvitacion;
    // Ajustar cupos solo si cambia entre estados que ocupan lugar o lo liberan.
    if (previousEstado !== estadoInvitacion) {
        const evento = await Evento.findById(invitation.evento);
        if (evento) {
            // Recalcular cuposDisponibles basado en invitaciones aceptadas
            const acceptedCount = await EventInvitation.countDocuments({
                evento: invitation.evento,
                estadoInvitacion: 'aceptada'
            });
            const newCuposDisponibles = evento.cupos - acceptedCount;
            await Evento.findByIdAndUpdate(invitation.evento, { cuposDisponibles: newCuposDisponibles });
        }
    }
    invitation.estadoInvitacion = estadoInvitacion;
    invitation.fechaRespuesta = new Date();
    await invitation.save();
    return invitation;
};
/**
 * Responde a una invitación (aceptar o rechazar)
 */
export const respondToInvitationByToken = async (token, respuesta) => {
    const invitation = await EventInvitation.findOne({ token });
    if (!invitation) {
        throw new Error('Invitación no encontrada');
    }
    if (invitation.estadoInvitacion !== 'enviada') {
        throw new Error('Esta invitación ya fue respondida');
    }
    invitation.estadoInvitacion = respuesta;
    invitation.fechaRespuesta = new Date();
    await invitation.save();
    // Recalcular cuposDisponibles basado en invitaciones aceptadas
    const acceptedCount = await EventInvitation.countDocuments({
        evento: invitation.evento,
        estadoInvitacion: 'aceptada'
    });
    const evento = await Evento.findById(invitation.evento);
    if (evento) {
        const newCuposDisponibles = evento.cupos - acceptedCount;
        await Evento.findByIdAndUpdate(invitation.evento, { cuposDisponibles: newCuposDisponibles });
    }
    return invitation;
};
/**
 * Marca asistencia manualmente
 */
export const markAttendance = async (invitationId, asistio) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation) {
        return null;
    }
    invitation.estadoAsistencia = asistio ? 'asistio' : 'no_asistio';
    if (asistio && !invitation.fechaUsoToken) {
        invitation.fechaUsoToken = new Date();
    }
    await invitation.save();
    return invitation;
};
/**
 * Regenera el código QR de una invitación
 */
export const regenerateQRCode = async (invitationId) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation) {
        throw new Error('Invitación no encontrada');
    }
    const newToken = generateToken();
    const newQRCode = await generateQRCode(newToken);
    invitation.token = newToken;
    invitation.qrCode = newQRCode;
    await invitation.save();
    return invitation;
};
