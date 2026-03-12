import EventInvitation from './eventInvitation.model.js';
import Evento from '../event/event.model.js';
import User from '../user/user.model.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { sendConfirmationEmail } from '../email/email.service.js';
const generateToken = () => crypto.randomBytes(32).toString('hex');
const generateQRCode = async (token) => {
    try {
        return await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });
    }
    catch (error) {
        throw new Error('No se pudo generar el código QR');
    }
};
// ─── Registro individual (auto-registro desde la app) ─────────────────────────
export const createSingleInvitation = async (eventoId, userId) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Error('Usuario no encontrado');
    // ¿Ya existe invitación?
    const existingInvitation = await EventInvitation.findOne({
        evento: eventoId,
        usuario: userId,
    });
    if (existingInvitation) {
        if (existingInvitation.estadoInvitacion === 'aceptada')
            return existingInvitation;
        if (existingInvitation.estadoInvitacion === 'rechazada')
            throw new Error('Ya rechazaste la invitación a este evento previamente');
        if (existingInvitation.estadoInvitacion === 'caducada')
            throw new Error('Tu invitación anterior caducó. Contacta al organizador.');
    }
    // Decrementar cupo atómicamente y obtener evento con datos populados
    const evento = await Evento.findOneAndUpdate({ _id: eventoId, cuposDisponibles: { $gt: 0 }, activo: true }, { $inc: { cuposDisponibles: -1 } }, { new: true })
        .populate('destino')
        .populate('espacio');
    if (!evento)
        throw new Error('No hay cupos disponibles o el evento no está activo');
    try {
        const token = generateToken();
        const qrCode = await generateQRCode(token);
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
        // ── Enviar correo de confirmación (no bloquea la respuesta) ───────────
        sendConfirmationEmail({
            nombre: user.nombre,
            email: user.email,
        }, evento, token)
            .then(async () => {
            await EventInvitation.findByIdAndUpdate(invitation._id, { emailEnviado: true });
            console.log(`📧 Confirmación enviada a ${user.email}`);
        })
            .catch(err => console.error('❌ Error enviando confirmación:', err));
        return invitation;
    }
    catch (error) {
        // Devolver cupo si algo falla
        await Evento.findByIdAndUpdate(eventoId, { $inc: { cuposDisponibles: 1 } });
        throw error;
    }
};
// ─── Invitaciones masivas ─────────────────────────────────────────────────────
export const createInvitationsForEvent = async (eventoId, userIds) => {
    const evento = await Evento.findById(eventoId);
    if (!evento)
        throw new Error('Evento no encontrado');
    const users = userIds?.length
        ? await User.find({ _id: { $in: userIds } })
        : await User.find({ activo: true });
    const results = { created: [], existing: [], failed: [] };
    for (const user of users) {
        try {
            const existing = await EventInvitation.findOne({ evento: eventoId, usuario: user._id });
            if (existing) {
                results.existing.push({ userId: user._id, email: user.email, invitationId: existing._id });
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
            results.created.push({ userId: user._id, email: user.email, invitationId: invitation._id });
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
// ─── El resto de funciones sin cambios ───────────────────────────────────────
export const findInvitationByToken = async (token) => EventInvitation.findOne({ token }).populate('evento').populate('usuario', '-password');
export const validateAndUseToken = async (token) => {
    const invitation = await EventInvitation.findOne({ token }).populate('evento');
    if (!invitation)
        throw new Error('Token inválido');
    if (invitation.estadoInvitacion !== 'aceptada')
        throw new Error('La invitación no ha sido aceptada');
    if (invitation.estadoAsistencia === 'asistio')
        throw new Error('Este token ya fue utilizado');
    const evento = invitation.evento;
    const eventDate = new Date(evento.fechaInicio);
    const now = new Date();
    if (eventDate < now && now.getTime() - eventDate.getTime() > 24 * 60 * 60 * 1000)
        throw new Error('El evento ya finalizó');
    invitation.estadoAsistencia = 'asistio';
    invitation.fechaUsoToken = new Date();
    invitation.intentosUso += 1;
    await invitation.save();
    return invitation;
};
export const findInvitationsByEvent = async (eventoId) => EventInvitation.find({ evento: eventoId })
    .populate('usuario', '-password')
    .sort({ fechaEnvio: -1 });
export const findInvitationsByUser = async (userId) => EventInvitation.find({ usuario: userId })
    .populate('evento')
    .sort({ fechaEnvio: -1 });
export const getEventInvitationStats = async (eventoId) => {
    const invitations = await EventInvitation.find({ evento: eventoId });
    return {
        total: invitations.length,
        enviadas: invitations.filter(i => i.estadoInvitacion === 'enviada').length,
        aceptadas: invitations.filter(i => i.estadoInvitacion === 'aceptada').length,
        rechazadas: invitations.filter(i => i.estadoInvitacion === 'rechazada').length,
        caducadas: invitations.filter(i => i.estadoInvitacion === 'caducada').length,
        asistencias: invitations.filter(i => i.estadoAsistencia === 'asistio').length,
        pendientes: invitations.filter(i => i.estadoAsistencia === 'pendiente').length,
        noAsistio: invitations.filter(i => i.estadoAsistencia === 'no_asistio').length,
    };
};
export const updateInvitationStatus = async (invitationId, estadoInvitacion) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation)
        return null;
    invitation.estadoInvitacion = estadoInvitacion;
    invitation.fechaRespuesta = new Date();
    await invitation.save();
    return invitation;
};
export const respondToInvitationByToken = async (token, respuesta) => {
    const invitation = await EventInvitation.findOne({ token });
    if (!invitation)
        throw new Error('Invitación no encontrada');
    if (invitation.estadoInvitacion !== 'enviada')
        throw new Error('Esta invitación ya fue respondida');
    invitation.estadoInvitacion = respuesta;
    invitation.fechaRespuesta = new Date();
    await invitation.save();
    if (respuesta === 'rechazada')
        await Evento.findByIdAndUpdate(invitation.evento, { $inc: { cuposDisponibles: 1 } });
    return invitation;
};
export const markAttendance = async (invitationId, asistio) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation)
        return null;
    invitation.estadoAsistencia = asistio ? 'asistio' : 'no_asistio';
    if (asistio && !invitation.fechaUsoToken)
        invitation.fechaUsoToken = new Date();
    await invitation.save();
    return invitation;
};
export const regenerateQRCode = async (invitationId) => {
    const invitation = await EventInvitation.findById(invitationId);
    if (!invitation)
        throw new Error('Invitación no encontrada');
    invitation.token = generateToken();
    invitation.qrCode = await generateQRCode(invitation.token);
    await invitation.save();
    return invitation;
};
