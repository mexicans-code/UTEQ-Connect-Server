import Event from './event.model.js';

export const findAllEvents = async () => {
  try {
    const events = await Event.find()
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre email" })
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
      .populate({ path: "creadoPor", select: "nombre email" });
    return event;
  } catch (error) {
    throw new Error('Error obteniendo evento');
  }
};

export const createEvent = async (eventData: any) => {
  try {
    if (eventData.cuposDisponibles > eventData.cupos) {
      throw new Error("Los cupos disponibles no pueden ser mayores que los cupos totales");
    }
    
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
    
    const event = await Event.findByIdAndUpdate(
      id,
      eventData,
      { new: true, runValidators: true }
    )
      .populate("destino")
      .populate({ path: "creadoPor", select: "nombre email" });
    return event;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const event = await Event.findByIdAndDelete(id);
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
      .populate({ path: "creadoPor", select: "nombre email" })
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
      .populate({ path: "creadoPor", select: "nombre email" })
      .sort({ fechaInicio: 1 });
    return events;
  } catch (error) {
    throw new Error('Error obteniendo eventos por destino');
  }
};