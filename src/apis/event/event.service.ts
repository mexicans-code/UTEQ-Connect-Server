import Event, { IEvent } from './event.model.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Interfaz para el encargado poblado
interface IPersonalPopulated {
  _id: mongoose.Types.ObjectId;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
}

// Interfaz para evento con creadoPor poblado
interface IEventPopulated extends Omit<IEvent, 'creadoPor'> {
  creadoPor?: IPersonalPopulated;
}

export const findAllEvents = async () => {
  try {
    const events = await Event.find()
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" })
      .sort({ fechaInicio: 1 });
    return events;
  } catch (error) {
    throw new Error('Error obteniendo eventos');
  }
};

export const findEventById = async (id: string) => {
  try {
    const event = await Event.findById(id)
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" });
    return event;
  } catch (error) {
    throw new Error('Error obteniendo evento');
  }
};

// Función auxiliar para verificar conflictos de eventos
const checkEventConflict = async (eventData: any, eventId?: string) => {
  const fechaInicio = new Date(eventData.fechaInicio);
  const fechaFin = new Date(eventData.fechaFin || eventData.fechaInicio);
  
  // Normalizar fechas a UTC
  fechaInicio.setUTCHours(0, 0, 0, 0);
  fechaFin.setUTCHours(23, 59, 59, 999);

  // Buscar eventos que se traslapen en fecha y destino
  const query: any = {
    destino: eventData.destino,
    activo: true,
    $or: [
      {
        fechaInicio: { $lte: fechaFin },
        fechaFin: { $gte: fechaInicio }
      }
    ]
  };

  // Si estamos editando, excluir el evento actual
  if (eventId) {
    query._id = { $ne: eventId };
  }

  const conflictingEvents = await Event.find(query)
    .populate({ 
      path: "creadoPor", 
      select: "nombre apellidoPaterno apellidoMaterno email" 
    })
    .lean() as IEventPopulated[]; // ✅ Usar lean() y tipar correctamente

  if (conflictingEvents.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }

  // Verificar conflictos de horario
  const conflicts = conflictingEvents.filter(event => {
    // Convertir horas a minutos para comparar
    const [h1Start, m1Start] = eventData.horaInicio.split(':').map(Number);
    const [h1End, m1End] = eventData.horaFin.split(':').map(Number);
    const newStart = h1Start * 60 + m1Start;
    const newEnd = h1End * 60 + m1End;

    const [h2Start, m2Start] = event.horaInicio.split(':').map(Number);
    const [h2End, m2End] = event.horaFin.split(':').map(Number);
    const existingStart = h2Start * 60 + m2Start;
    const existingEnd = h2End * 60 + m2End;

    // Verificar si hay traslape de horarios
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });

  if (conflicts.length > 0) {
    return {
      hasConflict: true,
      conflicts: conflicts.map(c => {
        const encargado = c.creadoPor as IPersonalPopulated | undefined; // ✅ Cast explícito
        
        return {
          titulo: c.titulo,
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
          horaInicio: c.horaInicio,
          horaFin: c.horaFin,
          encargado: encargado ? {
            nombre: `${encargado.nombre} ${encargado.apellidoPaterno}`,
            email: encargado.email
          } : null
        };
      })
    };
  }

  return { hasConflict: false, conflicts: [] };
};

export const createEvent = async (eventData: any) => {
  try {
    if (eventData.cuposDisponibles > eventData.cupos) {
      throw new Error("Los cupos disponibles no pueden ser mayores que los cupos totales");
    }
    
    // Verificar conflictos
    const conflictCheck = await checkEventConflict(eventData);
    
    if (conflictCheck.hasConflict) {
      const conflictMessages = conflictCheck.conflicts.map(c => 
        `• "${c.titulo}" - ${new Date(c.fechaInicio).toLocaleDateString('es-MX')} (${c.horaInicio}-${c.horaFin}) - Encargado: ${c.encargado?.nombre || 'No asignado'} (${c.encargado?.email || 'Sin email'})`
      ).join('\n');
      
      throw new Error(
        `⚠️ CONFLICTO DE HORARIO DETECTADO\n\n` +
        `Ya existe(n) evento(s) en el mismo lugar y horario:\n\n${conflictMessages}\n\n` +
        `Por favor, ponte en contacto con el/los encargado(s) para coordinar o elegir otro horario/lugar.`
      );
    }
    
    // Normalizar fechas a UTC y establecer horarios
    const fechaInicio = new Date(eventData.fechaInicio);
    const fechaFin = new Date(eventData.fechaFin || eventData.fechaInicio);
    
    // Asegurarse de que las fechas sean válidas
    if (isNaN(fechaInicio.getTime())) {
      throw new Error('Fecha de inicio inválida');
    }
    if (isNaN(fechaFin.getTime())) {
      throw new Error('Fecha de fin inválida');
    }
    
    // Calcular fecha de desactivación automática (15 minutos después de la hora de fin en el último día)
    const [horaFin, minutosFin] = eventData.horaFin.split(':').map(Number);
    const desactivarEn = new Date(fechaFin);
    desactivarEn.setUTCHours(horaFin, minutosFin, 0, 0);
    desactivarEn.setMinutes(desactivarEn.getMinutes() + 15);
    
    eventData.fechaInicio = fechaInicio;
    eventData.fechaFin = fechaFin;
    eventData.desactivarEn = desactivarEn;
    
    const event = new Event(eventData);
    await event.save();
    return event;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: any) => {
  try {
    if (eventData.cuposDisponibles !== undefined && eventData.cupos !== undefined) {
      if (eventData.cuposDisponibles > eventData.cupos) {
        throw new Error("Los cupos disponibles no pueden ser mayores que los cupos totales");
      }
    }
    
    // Verificar conflictos solo si se cambian fecha, hora o destino
    if (eventData.fechaInicio || eventData.fechaFin || eventData.horaInicio || eventData.horaFin || eventData.destino) {
      const existingEvent = await Event.findById(id);
      if (!existingEvent) throw new Error("Evento no encontrado");
      
      const dataToCheck = {
        fechaInicio: eventData.fechaInicio || existingEvent.fechaInicio,
        fechaFin: eventData.fechaFin || existingEvent.fechaFin,
        horaInicio: eventData.horaInicio || existingEvent.horaInicio,
        horaFin: eventData.horaFin || existingEvent.horaFin,
        destino: eventData.destino || existingEvent.destino
      };
      
      const conflictCheck = await checkEventConflict(dataToCheck, id);
      
      if (conflictCheck.hasConflict) {
        const conflictMessages = conflictCheck.conflicts.map(c => 
          `• "${c.titulo}" - ${new Date(c.fechaInicio).toLocaleDateString('es-MX')} (${c.horaInicio}-${c.horaFin}) - Encargado: ${c.encargado?.nombre || 'No asignado'} (${c.encargado?.email || 'Sin email'})`
        ).join('\n');
        
        throw new Error(
          `⚠️ CONFLICTO DE HORARIO DETECTADO\n\n` +
          `Ya existe(n) evento(s) en el mismo lugar y horario:\n\n${conflictMessages}\n\n` +
          `Por favor, ponte en contacto con el/los encargado(s) para coordinar o elegir otro horario/lugar.`
        );
      }
    }
    
    // Recalcular fecha de desactivación si se actualizó la fecha o hora de fin
    if (eventData.fechaFin || eventData.horaFin) {
      const event = await Event.findById(id);
      if (!event) throw new Error("Evento no encontrado");
      
      const fechaFin = new Date(eventData.fechaFin || event.fechaFin);
      const horaFin = eventData.horaFin || event.horaFin;
      const [hora, minutos] = horaFin.split(':').map(Number);
      
      fechaFin.setUTCHours(hora, minutos, 0, 0);
      fechaFin.setMinutes(fechaFin.getMinutes() + 15);
      
      eventData.desactivarEn = fechaFin;
    }
    
    const event = await Event.findByIdAndUpdate(
      id,
      eventData,
      { new: true, runValidators: true }
    )
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" });
    return event;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const event = await Event.findById(id);
    
    // Eliminar imagen si existe
    if (event?.image) {
      const imagePath = path.join(process.cwd(), event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Event.findByIdAndDelete(id);
    return event;
  } catch (error) {
    throw new Error('Error eliminando evento');
  }
};

export const deactivateEvent = async (id: string) => {
  try {
    const event = await Event.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );
    return event;
  } catch (error) {
    throw new Error('Error desactivando evento');
  }
};

export const updateCuposDisponibles = async (id: string, cantidad: number) => {
  try {
    const event = await Event.findById(id);
    
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    event.cuposDisponibles += cantidad;

    if (event.cuposDisponibles < 0) {
      throw new Error("No hay suficientes cupos disponibles");
    }

    if (event.cuposDisponibles > event.cupos) {
      throw new Error("Los cupos disponibles no pueden exceder los cupos totales");
    }

    await event.save();
    return event;
  } catch (error) {
    throw error;
  }
};

export const findActiveEvents = async () => {
  try {
    const events = await Event.find({ activo: true })
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" })
      .sort({ fechaInicio: 1 });
    return events;
  } catch (error) {
    throw new Error('Error obteniendo eventos activos');
  }
};

export const findEventsByDestino = async (destinoId: string) => {
  try {
    const events = await Event.find({ destino: destinoId })
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre apellidoPaterno apellidoMaterno email" })
      .sort({ fechaInicio: 1 });
    return events;
  } catch (error) {
    throw new Error('Error obteniendo eventos por destino');
  }
};

export const updateEventImage = async (id: string, imagePath: string) => {
  try {
    const oldEvent = await Event.findById(id);
    
    // Eliminar imagen anterior si existe
    if (oldEvent?.image) {
      const oldImagePath = path.join(process.cwd(), oldEvent.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    const event = await Event.findByIdAndUpdate(
      id,
      { image: imagePath },
      { new: true }
    );
    return event;
  } catch (error) {
    throw new Error('Error actualizando imagen del evento');
  }
};

export const deleteEventImage = async (id: string) => {
  try {
    const event = await Event.findById(id);
    
    if (event?.image) {
      const imagePath = path.join(process.cwd(), event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      event.image = undefined;
      await event.save();
    }
    
    return event;
  } catch (error) {
    throw new Error('Error eliminando imagen del evento');
  }
};

// Función para desactivar eventos automáticamente
export const deactivateExpiredEvents = async () => {
  try {
    const now = new Date();
    
    const result = await Event.updateMany(
      {
        activo: true,
        desactivarEn: { $lte: now }
      },
      {
        $set: { activo: false }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`⏰ ${result.modifiedCount} evento(s) desactivado(s) automáticamente`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error desactivando eventos expirados:', error);
    throw new Error('Error desactivando eventos expirados');
  }
};