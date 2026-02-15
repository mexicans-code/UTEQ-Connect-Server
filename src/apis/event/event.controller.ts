import { Request, Response } from 'express';
import * as eventService from './event.service.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.findAllEvents();
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await eventService.findEventById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    let imagePath: string | undefined = undefined;
    if (req.file) {
      imagePath = `uploads/events/${req.file.filename}`;
    }
    
    const eventData = {
      ...req.body,
      image: imagePath
    };
    
    const event = await eventService.createEvent(eventData);
    res.status(201).json({
      success: true,
      message: "Evento creado exitosamente",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const updateData: any = { ...req.body };
    
    if (req.file) {
      updateData.image = `uploads/events/${req.file.filename}`;
      
      // Eliminar imagen anterior
      const oldEvent = await eventService.findEventById(id);
      if (oldEvent?.image) {
        const fs = await import('fs');
        const path = await import('path');
        const oldImagePath = path.join(process.cwd(), oldEvent.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const event = await eventService.updateEvent(id, updateData);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    res.json({
      success: true,
      message: "Evento actualizado exitosamente",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await eventService.deleteEvent(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    res.json({
      success: true,
      message: "Evento eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deactivateEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await eventService.deactivateEvent(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    res.json({
      success: true,
      message: "Evento desactivado exitosamente",
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateCupos = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const cantidad = Number(req.body.cantidad);
    const event = await eventService.updateCuposDisponibles(id, cantidad);
    res.json({
      success: true,
      message: "Cupos actualizados exitosamente",
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getActiveEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.findActiveEvents();
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getEventsByDestino = async (req: Request, res: Response) => {
  try {
    const destinoId = req.params.destinoId as string;
    const events = await eventService.findEventsByDestino(destinoId);
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const uploadEventImage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha proporcionado ninguna imagen'
      });
    }
    
    const imagePath = `uploads/events/${req.file.filename}`;
    const event = await eventService.updateEventImage(id, imagePath);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: event,
      imageUrl: `${req.protocol}://${req.get('host')}/${imagePath}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteEventImage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const event = await eventService.deleteEventImage(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};