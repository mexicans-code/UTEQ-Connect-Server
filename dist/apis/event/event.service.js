import Event from './event.model.js';
import Espacio from '../space/Espacio.model.js';
import fs from 'fs';
import path from 'path';
// ─── Helper: populate estándar ────────────────────────────────────────────────
const eventPopulate = (query) => query
    .populate("destino")
    .populate("espacio")
    .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" });
// ─── Helper: recalcula si un espacio está ocupado en este momento ─────────────
// Un espacio está ocupado si existe al menos un evento activo que:
//   - tenga ese espacio asignado
//   - su rango de fechas incluya HOY
//   - su rango de horas incluya LA HORA ACTUAL
export const recalcularOcupadoEspacio = async (espacioId) => {
    const now = new Date();
    const hoy = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const horaActualMin = now.getHours() * 60 + now.getMinutes();
    const eventosActivos = await Event.find({
        espacio: espacioId,
        activo: true,
        fechaInicio: { $lte: new Date(hoy.getTime() + 86400000 - 1) }, // hasta fin del día
        fechaFin: { $gte: hoy },
    }).lean();
    const ocupadoAhora = eventosActivos.some(ev => {
        const [hI, mI] = ev.horaInicio.split(':').map(Number);
        const [hF, mF] = ev.horaFin.split(':').map(Number);
        const inicioMin = hI * 60 + mI;
        const finMin = hF * 60 + mF;
        return horaActualMin >= inicioMin && horaActualMin < finMin;
    });
    await Espacio.findByIdAndUpdate(espacioId, { ocupado: ocupadoAhora });
    return ocupadoAhora;
};
// ─── Helper: revisa conflictos de horario en el MISMO espacio ────────────────
const checkEspacioConflict = async (eventData, eventId) => {
    if (!eventData.espacio)
        return { hasConflict: false, conflicts: [] };
    const fechaInicio = new Date(eventData.fechaInicio);
    const fechaFin = new Date(eventData.fechaFin || eventData.fechaInicio);
    fechaInicio.setUTCHours(0, 0, 0, 0);
    fechaFin.setUTCHours(23, 59, 59, 999);
    const query = {
        espacio: eventData.espacio,
        activo: true,
        fechaInicio: { $lte: fechaFin },
        fechaFin: { $gte: fechaInicio },
    };
    if (eventId)
        query._id = { $ne: eventId };
    const conflictingEvents = await Event.find(query)
        .populate({ path: "creadoPor", select: "nombre apellidoPaterno email" })
        .lean();
    const conflicts = conflictingEvents.filter(ev => {
        const [h1S, m1S] = eventData.horaInicio.split(':').map(Number);
        const [h1E, m1E] = eventData.horaFin.split(':').map(Number);
        const newStart = h1S * 60 + m1S;
        const newEnd = h1E * 60 + m1E;
        const [h2S, m2S] = ev.horaInicio.split(':').map(Number);
        const [h2E, m2E] = ev.horaFin.split(':').map(Number);
        const exStart = h2S * 60 + m2S;
        const exEnd = h2E * 60 + m2E;
        return (newStart < exEnd && newEnd > exStart);
    });
    if (conflicts.length > 0) {
        return {
            hasConflict: true,
            conflicts: conflicts.map(c => {
                const enc = c.creadoPor;
                return {
                    titulo: c.titulo,
                    fechaInicio: c.fechaInicio,
                    fechaFin: c.fechaFin,
                    horaInicio: c.horaInicio,
                    horaFin: c.horaFin,
                    encargado: enc ? { nombre: `${enc.nombre} ${enc.apellidoPaterno}`, email: enc.email } : null
                };
            })
        };
    }
    return { hasConflict: false, conflicts: [] };
};
// ─── Helper: conflicto de destino (lógica original) ──────────────────────────
const checkEventConflict = async (eventData, eventId) => {
    const fechaInicio = new Date(eventData.fechaInicio);
    const fechaFin = new Date(eventData.fechaFin || eventData.fechaInicio);
    fechaInicio.setUTCHours(0, 0, 0, 0);
    fechaFin.setUTCHours(23, 59, 59, 999);
    const query = {
        destino: eventData.destino,
        activo: true,
        $or: [{ fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } }]
    };
    if (eventId)
        query._id = { $ne: eventId };
    const conflictingEvents = await Event.find(query)
        .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" })
        .lean();
    if (conflictingEvents.length === 0)
        return { hasConflict: false, conflicts: [] };
    const conflicts = conflictingEvents.filter(ev => {
        const [h1S, m1S] = eventData.horaInicio.split(':').map(Number);
        const [h1E, m1E] = eventData.horaFin.split(':').map(Number);
        const newStart = h1S * 60 + m1S;
        const newEnd = h1E * 60 + m1E;
        const [h2S, m2S] = ev.horaInicio.split(':').map(Number);
        const [h2E, m2E] = ev.horaFin.split(':').map(Number);
        const exStart = h2S * 60 + m2S;
        const exEnd = h2E * 60 + m2E;
        return (newStart < exEnd && newEnd > exStart);
    });
    if (conflicts.length > 0) {
        return {
            hasConflict: true,
            conflicts: conflicts.map(c => {
                const enc = c.creadoPor;
                return {
                    titulo: c.titulo,
                    fechaInicio: c.fechaInicio,
                    fechaFin: c.fechaFin,
                    horaInicio: c.horaInicio,
                    horaFin: c.horaFin,
                    encargado: enc ? { nombre: `${enc.nombre} ${enc.apellidoPaterno}`, email: enc.email } : null
                };
            })
        };
    }
    return { hasConflict: false, conflicts: [] };
};
// ─── CRUD ─────────────────────────────────────────────────────────────────────
export const findAllEvents = async () => {
    try {
        return await eventPopulate(Event.find().sort({ fechaInicio: 1 }));
    }
    catch {
        throw new Error('Error obteniendo eventos');
    }
};
export const findEventById = async (id) => {
    try {
        return await eventPopulate(Event.findById(id));
    }
    catch {
        throw new Error('Error obteniendo evento');
    }
};
export const createEvent = async (eventData) => {
    try {
        if (eventData.cuposDisponibles > eventData.cupos)
            throw new Error("Los cupos disponibles no pueden ser mayores que los cupos totales");
        // Verificar conflicto de destino
        const conflictDest = await checkEventConflict(eventData);
        if (conflictDest.hasConflict) {
            const msgs = conflictDest.conflicts.map(c => `• "${c.titulo}" - ${new Date(c.fechaInicio).toLocaleDateString('es-MX')} (${c.horaInicio}-${c.horaFin}) - Encargado: ${c.encargado?.nombre || 'No asignado'} (${c.encargado?.email || 'Sin email'})`).join('\n');
            throw new Error(`⚠️ CONFLICTO DE HORARIO DETECTADO\n\nYa existe(n) evento(s) en el mismo lugar y horario:\n\n${msgs}\n\nPor favor, ponte en contacto con el/los encargado(s) para coordinar o elegir otro horario/lugar.`);
        }
        // Verificar conflicto de espacio
        const conflictEsp = await checkEspacioConflict(eventData);
        if (conflictEsp.hasConflict) {
            const msgs = conflictEsp.conflicts.map(c => `• "${c.titulo}" (${c.horaInicio}-${c.horaFin})`).join('\n');
            throw new Error(`⚠️ ESPACIO NO DISPONIBLE\n\nEse espacio ya está reservado en ese horario:\n\n${msgs}\n\nElige otro espacio u horario.`);
        }
        const fechaInicio = new Date(eventData.fechaInicio);
        const fechaFin = new Date(eventData.fechaFin || eventData.fechaInicio);
        if (isNaN(fechaInicio.getTime()))
            throw new Error('Fecha de inicio inválida');
        if (isNaN(fechaFin.getTime()))
            throw new Error('Fecha de fin inválida');
        const [horaFin, minutosFin] = eventData.horaFin.split(':').map(Number);
        const desactivarEn = new Date(fechaFin);
        desactivarEn.setUTCHours(horaFin, minutosFin, 0, 0);
        desactivarEn.setMinutes(desactivarEn.getMinutes() + 15);
        eventData.fechaInicio = fechaInicio;
        eventData.fechaFin = fechaFin;
        eventData.desactivarEn = desactivarEn;
        const event = new Event(eventData);
        await event.save();
        // Recalcular estado del espacio
        if (eventData.espacio)
            await recalcularOcupadoEspacio(eventData.espacio.toString());
        return event;
    }
    catch (error) {
        throw error;
    }
};
export const updateEvent = async (id, eventData) => {
    try {
        if (eventData.cuposDisponibles !== undefined && eventData.cupos !== undefined) {
            if (eventData.cuposDisponibles > eventData.cupos)
                throw new Error("Los cupos disponibles no pueden ser mayores que los cupos totales");
        }
        const existingEvent = await Event.findById(id);
        if (!existingEvent)
            throw new Error("Evento no encontrado");
        const dataToCheck = {
            fechaInicio: eventData.fechaInicio || existingEvent.fechaInicio,
            fechaFin: eventData.fechaFin || existingEvent.fechaFin,
            horaInicio: eventData.horaInicio || existingEvent.horaInicio,
            horaFin: eventData.horaFin || existingEvent.horaFin,
            destino: eventData.destino || existingEvent.destino,
            espacio: eventData.espacio || existingEvent.espacio,
        };
        // Conflicto de destino
        const conflictDest = await checkEventConflict(dataToCheck, id);
        if (conflictDest.hasConflict) {
            const msgs = conflictDest.conflicts.map(c => `• "${c.titulo}" - ${new Date(c.fechaInicio).toLocaleDateString('es-MX')} (${c.horaInicio}-${c.horaFin}) - Encargado: ${c.encargado?.nombre || 'No asignado'} (${c.encargado?.email || 'Sin email'})`).join('\n');
            throw new Error(`⚠️ CONFLICTO DE HORARIO DETECTADO\n\nYa existe(n) evento(s) en el mismo lugar y horario:\n\n${msgs}\n\nPor favor, ponte en contacto con el/los encargado(s) para coordinar o elegir otro horario/lugar.`);
        }
        // Conflicto de espacio
        const conflictEsp = await checkEspacioConflict(dataToCheck, id);
        if (conflictEsp.hasConflict) {
            const msgs = conflictEsp.conflicts.map(c => `• "${c.titulo}" (${c.horaInicio}-${c.horaFin})`).join('\n');
            throw new Error(`⚠️ ESPACIO NO DISPONIBLE\n\nEse espacio ya está reservado en ese horario:\n\n${msgs}\n\nElige otro espacio u horario.`);
        }
        // Recalcular desactivarEn si cambió hora/fecha fin
        if (eventData.fechaFin || eventData.horaFin) {
            const fechaFin = new Date(eventData.fechaFin || existingEvent.fechaFin);
            const horaFin = eventData.horaFin || existingEvent.horaFin;
            const [hora, minutos] = horaFin.split(':').map(Number);
            fechaFin.setUTCHours(hora, minutos, 0, 0);
            fechaFin.setMinutes(fechaFin.getMinutes() + 15);
            eventData.desactivarEn = fechaFin;
        }
        const updated = await eventPopulate(Event.findByIdAndUpdate(id, eventData, { new: true, runValidators: true }));
        // Recalcular espacio anterior si cambió
        const espacioAnterior = existingEvent.espacio?.toString();
        const espacioNuevo = (eventData.espacio || existingEvent.espacio)?.toString();
        if (espacioAnterior)
            await recalcularOcupadoEspacio(espacioAnterior);
        if (espacioNuevo && espacioNuevo !== espacioAnterior)
            await recalcularOcupadoEspacio(espacioNuevo);
        return updated;
    }
    catch (error) {
        throw error;
    }
};
export const deleteEvent = async (id) => {
    try {
        const event = await Event.findById(id);
        if (event?.image) {
            const imagePath = path.join(process.cwd(), event.image);
            if (fs.existsSync(imagePath))
                fs.unlinkSync(imagePath);
        }
        await Event.findByIdAndDelete(id);
        // Liberar espacio si corresponde
        if (event?.espacio)
            await recalcularOcupadoEspacio(event.espacio.toString());
        return event;
    }
    catch {
        throw new Error('Error eliminando evento');
    }
};
export const deactivateEvent = async (id) => {
    try {
        const event = await Event.findById(id);
        const updated = await Event.findByIdAndUpdate(id, { activo: false }, { new: true });
        if (event?.espacio)
            await recalcularOcupadoEspacio(event.espacio.toString());
        return updated;
    }
    catch {
        throw new Error('Error desactivando evento');
    }
};
export const updateCuposDisponibles = async (id, cantidad) => {
    try {
        const event = await Event.findById(id);
        if (!event)
            throw new Error("Evento no encontrado");
        event.cuposDisponibles += cantidad;
        if (event.cuposDisponibles < 0)
            throw new Error("No hay suficientes cupos disponibles");
        if (event.cuposDisponibles > event.cupos)
            throw new Error("Los cupos disponibles no pueden exceder los cupos totales");
        await event.save();
        return event;
    }
    catch (error) {
        throw error;
    }
};
export const findActiveEvents = async () => {
    try {
        return await eventPopulate(Event.find({ activo: true }).sort({ fechaInicio: 1 }));
    }
    catch {
        throw new Error('Error obteniendo eventos activos');
    }
};
export const findEventsByDestino = async (destinoId) => {
    try {
        return await eventPopulate(Event.find({ destino: destinoId }).sort({ fechaInicio: 1 }));
    }
    catch {
        throw new Error('Error obteniendo eventos por destino');
    }
};
export const updateEventImage = async (id, imagePath) => {
    try {
        return await Event.findByIdAndUpdate(id, { image: imagePath }, { new: true });
    }
    catch {
        throw new Error('Error actualizando imagen del evento');
    }
};
export const deleteEventImage = async (id) => {
    try {
        const event = await Event.findById(id);
        if (event?.image) {
            const imgPath = path.join(process.cwd(), event.image);
            if (fs.existsSync(imgPath))
                fs.unlinkSync(imgPath);
            event.image = undefined;
            await event.save();
        }
        return event;
    }
    catch {
        throw new Error('Error eliminando imagen del evento');
    }
};
// ─── Tarea programada: desactivar eventos expirados y recalcular espacios ─────
export const deactivateExpiredEvents = async () => {
    try {
        const now = new Date();
        // Obtener los eventos que van a desactivarse para recalcular sus espacios después
        const expiredEvents = await Event.find({
            activo: true,
            desactivarEn: { $lte: now }
        }).lean();
        const result = await Event.updateMany({ activo: true, desactivarEn: { $lte: now } }, { $set: { activo: false } });
        if (result.modifiedCount > 0) {
            console.log(`⏰ ${result.modifiedCount} evento(s) desactivado(s) automáticamente`);
            // Recalcular estado de cada espacio afectado
            const espaciosAfectados = [
                ...new Set(expiredEvents
                    .filter(ev => ev.espacio)
                    .map(ev => ev.espacio.toString()))
            ];
            for (const espacioId of espaciosAfectados) {
                await recalcularOcupadoEspacio(espacioId);
            }
        }
        return result.modifiedCount;
    }
    catch (error) {
        console.error('Error desactivando eventos expirados:', error);
        throw new Error('Error desactivando eventos expirados');
    }
};
