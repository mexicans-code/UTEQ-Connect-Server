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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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
    const event = await eventService.createEvent(req.body);
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const event = await eventService.updateEvent(id, req.body);
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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
    const destinoId = Array.isArray(req.params.destinoId) ? req.params.destinoId[0] : req.params.destinoId;
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